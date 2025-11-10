import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Calendar,
  Clock,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Eye,
  Download,
} from 'lucide-react';
import { Card } from '../../ui/card';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../ui/dialog';

// API
import { apiFetch } from '../../../api/client';

type BookingStatus = 'PENDING'|'CONFIRMED'|'COMPLETED'|'CANCELLED';
interface BookingItem {
  id: string;
  clientId: string;
  client: { id: string; name: string; email?: string|null; phone?: string|null };
  serviceId?: string|null;
  service?: { id: string; title: string } | null;
  startTime: string;
  endTime?: string|null;
  status: BookingStatus;
  notes?: string|null;
  priceCents?: number|null;
}
interface ClientItem { id: string; name: string; email?: string|null; phone?: string|null }
interface ServiceItem { id: string; title: string }

export function BookingsManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all'|BookingStatus>('all');
  const [selectedBooking, setSelectedBooking] = useState<BookingItem|null>(null);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);

  // New/Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<BookingItem|null>(null);
  const [form, setForm] = useState<{ clientId: string; serviceId?: string; startTime: string; endTime?: string; status: BookingStatus; notes?: string; price?: string }>({ clientId: '', serviceId: '', startTime: '', endTime: '', status: 'PENDING', notes: '', price: '' });

  const load = async () => {
    try {
      setLoading(true); setError(null);
      const [items, svc, cls] = await Promise.all([
        apiFetch<BookingItem[]>('/bookings'),
        apiFetch<ServiceItem[]>('/services'),
        apiFetch<ClientItem[]>('/clients'),
      ]);
      setBookings(items);
      setServices(svc as any);
      setClients(cls);
    } catch (e: any) { setError(e?.message || 'Failed to load bookings'); }
    finally { setLoading(false); }
  };
  useEffect(()=>{ load(); }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const patchStatus = async (id: string, status: BookingStatus) => {
    try {
      const updated = await apiFetch<BookingItem>(`/bookings/${id}/status`, { method: 'PATCH', body: { status } });
      setBookings(prev => prev.map(b => b.id === id ? updated : b));
      toast.success(`Status updated to ${status.toLowerCase()}`);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update status');
    }
  };

  const handleConfirm = (id: string) => patchStatus(id, 'CONFIRMED');
  const handleCancel = (id: string) => patchStatus(id, 'CANCELLED');

  const filteredBookings = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return bookings.filter((b) => {
      const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
      const clientName = b.client?.name?.toLowerCase() || '';
      const serviceTitle = b.service?.title?.toLowerCase() || '';
      const matchesSearch = clientName.includes(q) || b.id.toLowerCase().includes(q) || serviceTitle.includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [bookings, filterStatus, searchQuery]);

  const fmtDate = (iso?: string|null) => iso ? new Date(iso).toLocaleDateString() : '';
  const fmtTime = (iso?: string|null) => iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  const fmtPrice = (cents?: number|null) => (cents ?? 0) > 0 ? `$${((cents as number)/100).toLocaleString()}` : '—';

  const openCreate = () => {
    setEditing(null);
    setForm({ clientId: '', serviceId: '', startTime: '', endTime: '', status: 'PENDING', notes: '', price: '' });
    setEditOpen(true);
  };
  const openEdit = (b: BookingItem) => {
    setEditing(b);
    setForm({
      clientId: b.clientId,
      serviceId: b.serviceId || '',
      startTime: b.startTime ? b.startTime.slice(0,16) : '',
      endTime: b.endTime ? b.endTime.slice(0,16) : '',
      status: b.status,
      notes: b.notes || '',
      price: b.priceCents ? String((b.priceCents/100).toFixed(2)) : ''
    });
    setEditOpen(true);
  };

  const saveBooking = async () => {
    try {
      if (!form.clientId || !form.startTime) { toast.error('Client and start time are required'); return; }
      const body = {
        clientId: form.clientId,
        serviceId: form.serviceId || undefined,
        startTime: new Date(form.startTime).toISOString(),
        endTime: form.endTime ? new Date(form.endTime).toISOString() : undefined,
        status: form.status,
        notes: form.notes || undefined,
        priceCents: form.price ? Math.round(parseFloat(form.price) * 100) : undefined,
      };
      if (editing) {
        const updated = await apiFetch<BookingItem>(`/bookings/${editing.id}`, { method: 'PUT', body });
        setBookings(prev => prev.map(b => b.id === editing.id ? updated : b));
        toast.success('Booking updated');
      } else {
        const created = await apiFetch<BookingItem>('/bookings', { method: 'POST', body });
        setBookings(prev => [created, ...prev]);
        toast.success('Booking created');
      }
      setEditOpen(false); setEditing(null);
    } catch (e: any) {
      toast.error(e?.message || 'Save failed');
    }
  };

  const deleteBooking = async (b: BookingItem) => {
    if (!confirm('Delete this booking?')) return;
    try { await apiFetch(`/bookings/${b.id}`, { method: 'DELETE' }); setBookings(prev => prev.filter(x => x.id !== b.id)); toast.success('Deleted'); }
    catch (e: any) { toast.error(e?.message || 'Delete failed'); }
  };

  const stats = [
    { label: 'Total Bookings', value: bookings.length, color: 'from-pink-500 to-rose-600' },
    { label: 'Confirmed', value: bookings.filter((b) => b.status === 'CONFIRMED').length, color: 'from-green-500 to-emerald-600' },
    { label: 'Pending', value: bookings.filter((b) => b.status === 'PENDING').length, color: 'from-yellow-500 to-orange-600' },
    { label: 'Cancelled', value: bookings.filter((b) => b.status === 'CANCELLED').length, color: 'from-red-500 to-rose-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-gray-900">Bookings Management</h1>
          <p className="text-gray-600">Manage all appointments and reservations</p>
        </div>
        <Button onClick={openCreate} className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl">
          New Booking
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4 border-0 shadow-lg">
              <p className="text-gray-600 mb-2">{stat.label}</p>
              <div className={`bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.value}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-4 border-0 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by client, ID, or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full md:w-48 rounded-xl">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="rounded-xl">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </Card>

      {/* Bookings Table */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking, index) => (
                <motion.tr
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <TableCell>{booking.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-gray-900">{booking.client?.name}</p>
                      <p className="text-gray-500">{booking.client?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{booking.service?.title || '—'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-gray-900">{fmtDate(booking.startTime)}</p>
                        <p className="text-gray-500">{fmtTime(booking.startTime)}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {booking.endTime ? `${fmtTime(booking.startTime)} - ${fmtTime(booking.endTime)}` : '—'}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-900">{fmtPrice(booking.priceCents)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedBooking(booking)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEdit(booking)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {booking.status === 'PENDING' && (
                          <DropdownMenuItem onClick={() => handleConfirm(booking.id)}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Confirm
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleCancel(booking.id)} className="text-red-600">
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancel
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => deleteBooking(booking)} className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Booking Details Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={(o: boolean) => { if (!o) setSelectedBooking(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details - {selectedBooking?.id}</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 mb-1">Client Name</p>
                  <p className="text-gray-900">{selectedBooking.client?.name}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Email</p>
                  <p className="text-gray-900">{selectedBooking.client?.email || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Phone</p>
                  <p className="text-gray-900">{selectedBooking.client?.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Service</p>
                  <p className="text-gray-900">{selectedBooking.service?.title || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Date</p>
                  <p className="text-gray-900">{fmtDate(selectedBooking.startTime)}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Time</p>
                  <p className="text-gray-900">{fmtTime(selectedBooking.startTime)}{selectedBooking.endTime ? ` - ${fmtTime(selectedBooking.endTime)}` : ''}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Duration</p>
                  <p className="text-gray-900">{selectedBooking.endTime ? `${fmtTime(selectedBooking.startTime)} - ${fmtTime(selectedBooking.endTime)}` : '—'}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Price</p>
                  <p className="text-gray-900">{fmtPrice(selectedBooking.priceCents)}</p>
                </div>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Status</p>
                <Badge className={getStatusColor(selectedBooking.status)}>
                  {selectedBooking.status}
                </Badge>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Notes</p>
                <p className="text-gray-900">{selectedBooking.notes || '—'}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedBooking(null)}>
              Close
            </Button>
            <Button onClick={() => { if (selectedBooking) openEdit(selectedBooking); }} className="bg-gradient-to-r from-pink-500 to-purple-600">
              Edit Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(o: boolean)=> { if (!o) { setEditOpen(false); setEditing(null);} }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Booking' : 'New Booking'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-700">Client*</label>
              <select value={form.clientId} onChange={(e)=> setForm(f=>({ ...f, clientId: e.target.value }))} className="mt-2 w-full rounded-xl border-gray-300">
                <option value="">Select client…</option>
                {clients.map(c => (<option key={c.id} value={c.id}>{c.name} {c.email ? `(${c.email})` : ''}</option>))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-700">Service</label>
              <select value={form.serviceId || ''} onChange={(e)=> setForm(f=>({ ...f, serviceId: e.target.value }))} className="mt-2 w-full rounded-xl border-gray-300">
                <option value="">—</option>
                {services.map(s => (<option key={s.id} value={s.id}>{s.title}</option>))}
              </select>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-700">Start*</label>
                <input type="datetime-local" value={form.startTime} onChange={(e)=> setForm(f=>({ ...f, startTime: e.target.value }))} className="mt-2 w-full rounded-xl border-gray-300" />
              </div>
              <div>
                <label className="text-sm text-gray-700">End</label>
                <input type="datetime-local" value={form.endTime || ''} onChange={(e)=> setForm(f=>({ ...f, endTime: e.target.value }))} className="mt-2 w-full rounded-xl border-gray-300" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-700">Status</label>
                <select value={form.status} onChange={(e)=> setForm(f=>({ ...f, status: e.target.value as BookingStatus }))} className="mt-2 w-full rounded-xl border-gray-300">
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-700">Price (USD)</label>
                <input type="number" step="0.01" value={form.price || ''} onChange={(e)=> setForm(f=>({ ...f, price: e.target.value }))} className="mt-2 w-full rounded-xl border-gray-300" />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-700">Notes</label>
              <textarea value={form.notes || ''} onChange={(e)=> setForm(f=>({ ...f, notes: e.target.value }))} className="mt-2 w-full rounded-xl border-gray-300" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=> { setEditOpen(false); setEditing(null);} }>Cancel</Button>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600" onClick={saveBooking}>{editing ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
