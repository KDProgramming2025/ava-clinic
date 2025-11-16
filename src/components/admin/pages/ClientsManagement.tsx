import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Users, Search, Filter, MoreVertical, Mail, Phone, Calendar, Edit, Trash2, Eye, Download, UserPlus } from 'lucide-react';
import { Card } from '../../ui/card';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Avatar, AvatarFallback } from '../../ui/avatar';
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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Textarea } from '../../ui/textarea';
import { apiFetch } from '../../../api/client';
import { useLanguage } from '../../LanguageContext';
import { toast } from 'sonner';

type ClientStatus = 'ACTIVE' | 'INACTIVE';
interface ClientItem {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  joinDate: string;
  lastVisit?: string | null;
  status: ClientStatus;
  notes?: string | null;
}

export function ClientsManagement() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'ACTIVE' | 'INACTIVE'>('all');
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<ClientItem | null>(null);
  const [form, setForm] = useState<Partial<ClientItem>>({ name: '', email: '', phone: '', status: 'ACTIVE', notes: '' });

  // Debounce search input
  const debouncedSearch = useMemo(() => {
    let t: any;
    return (q: string, cb: (v: string) => void) => {
      clearTimeout(t);
      t = setTimeout(() => cb(q), 300);
    };
  }, []);

  const load = async (q?: string, status?: 'ACTIVE' | 'INACTIVE' | 'all') => {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, any> = {}; 
      if (q) params.search = q;
      if (status && status !== 'all') params.status = status;
      const data = await apiFetch<ClientItem[]>('/clients', { method: 'GET', body: undefined, headers: undefined, auth: undefined });
      // If server supports query params, prefer it; otherwise filter client-side
      const result = data.filter(c => {
        const matchesStatus = status && status !== 'all' ? c.status === status : true;
        const qq = (q || '').toLowerCase();
        const matchesSearch = !qq || [c.name, c.email || '', c.phone || '', c.id].some(v => v.toLowerCase().includes(qq));
        return matchesStatus && matchesSearch;
      });
      setClients(result);
    } catch (e: any) {
      setError(e?.message || t('admin.saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(searchQuery, filterType); }, []);
  useEffect(() => {
    debouncedSearch(searchQuery, (v) => load(v, filterType));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);
  useEffect(() => { load(searchQuery, filterType); // refresh on filter change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-700';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const filteredClients = clients; // already filtered in load()

  const now = new Date();
  const isSameMonth = (d: string) => {
    const dt = new Date(d);
    return dt.getFullYear() === now.getFullYear() && dt.getMonth() === now.getMonth();
  };
  const stats = [
    { label: t('admin.totalClients'), value: clients.length, color: 'from-pink-500 to-rose-600' },
    { label: t('admin.active'), value: clients.filter((c) => c.status === 'ACTIVE').length, color: 'from-green-500 to-emerald-600' },
    { label: t('admin.inactive'), value: clients.filter((c) => c.status === 'INACTIVE').length, color: 'from-purple-500 to-violet-600' },
    { label: t('admin.newThisMonth'), value: clients.filter((c) => isSameMonth(c.joinDate)).length, color: 'from-blue-500 to-cyan-600' },
  ];

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', email: '', phone: '', status: 'ACTIVE', notes: '' });
    setEditOpen(true);
  };
  const openEdit = (c: ClientItem) => {
    setEditing(c);
    setForm({ ...c });
    setEditOpen(true);
  };
  const saveClient = async () => {
    try {
  if (!form.name || !form.name.trim()) { toast.error(t('admin.nameRequired')); return; }
      if (editing) {
        const updated = await apiFetch<ClientItem>(`/clients/${editing.id}`, { method: 'PUT', body: {
          name: form.name, email: form.email, phone: form.phone, status: form.status, notes: form.notes, lastVisit: form.lastVisit,
        }});
        setClients(prev => prev.map(c => c.id === updated.id ? updated : c));
        toast.success(t('admin.clientUpdated'));
      } else {
        const created = await apiFetch<ClientItem>('/clients', { method: 'POST', body: {
          name: form.name, email: form.email, phone: form.phone, status: form.status, notes: form.notes,
        }});
        setClients(prev => [created, ...prev]);
        toast.success(t('admin.clientAdded'));
      }
      setEditOpen(false);
    } catch (e: any) {
      toast.error(e?.message || t('admin.saveFailed'));
    }
  };
  const deleteClient = async (c: ClientItem) => {
  if (!confirm(`${t('admin.deleteConfirm')} ${c.name}?`)) return;
    try {
      await apiFetch(`/clients/${c.id}`, { method: 'DELETE' });
      setClients(prev => prev.filter(x => x.id !== c.id));
      toast.success(t('admin.clientDeleted'));
    } catch (e: any) {
      toast.error(e?.message || t('admin.deleteFailed'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-gray-900">{t('admin.clientsManagement')}</h1>
          <p className="text-gray-600">{t('admin.clientsManagementSubtitle')}</p>
        </div>
        <Button onClick={openCreate} className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl">
          <UserPlus className="w-4 h-4 mr-2" />
          {t('admin.addClient')}
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
                placeholder={t('admin.searchClientsPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
          </div>
          <Select value={filterType} onValueChange={(v: 'all' | 'ACTIVE' | 'INACTIVE') => setFilterType(v)}>
            <SelectTrigger className="w-full md:w-48 rounded-xl">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('admin.allClients')}</SelectItem>
              <SelectItem value="ACTIVE">{t('admin.active')}</SelectItem>
              <SelectItem value="INACTIVE">{t('admin.inactive')}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="rounded-xl">
            <Download className="w-4 h-4 mr-2" />
            {t('admin.export')}
          </Button>
        </div>
      </Card>

      {/* Clients Table */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('admin.client')}</TableHead>
                <TableHead>{t('admin.contact')}</TableHead>
                <TableHead>{t('admin.joinDate')}</TableHead>
                
                <TableHead>{t('admin.lastVisit') || 'Last Visit'}</TableHead>
                <TableHead>{t('admin.status')}</TableHead>
                <TableHead className="text-right">{t('admin.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client, index) => (
                <motion.tr
                  key={client.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white">
                          {getInitials(client.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-gray-900">{client.name}</p>
                        <p className="text-gray-500">{client.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{client.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{client.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {new Date(client.joinDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">{client.lastVisit ? new Date(client.lastVisit).toLocaleDateString() : t('admin.inactiveDash')}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(client.status)}>
                      {client.status}
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
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          {t('admin.viewProfile')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEdit(client)}>
                          <Edit className="w-4 h-4 mr-2" />
                          {t('admin.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="w-4 h-4 mr-2" />
                          {t('admin.sendEmail')}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Calendar className="w-4 h-4 mr-2" />
                          {t('admin.bookAppointment')}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => deleteClient(client)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          {t('admin.delete')}
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

      {/* Create/Edit Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? t('admin.editClient') : t('admin.addClient')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder={t('admin.fullName')}
              value={form.name || ''}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-xl"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder={t('admin.email')}
                value={form.email || ''}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="rounded-xl"
              />
              <Input
                placeholder={t('admin.phone')}
                value={form.phone || ''}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">{t('admin.status')}</label>
                <Select value={(form.status as ClientStatus) || 'ACTIVE'} onValueChange={(v: ClientStatus) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">{t('admin.active')}</SelectItem>
                    <SelectItem value="INACTIVE">{t('admin.inactive')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">{t('admin.lastVisit') || 'Last Visit'}</label>
                <Input type="date" value={form.lastVisit ? new Date(form.lastVisit).toISOString().slice(0,10) : ''} onChange={(e) => setForm({ ...form, lastVisit: e.target.value })} className="rounded-xl" />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">{t('admin.notes')}</label>
              <Textarea rows={4} value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="rounded-xl" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setEditOpen(false)}>{t('admin.cancel')}</Button>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl" onClick={saveClient}>
              {editing ? t('admin.saveChanges') : t('admin.createClient')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
