import { useState } from 'react';
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
import { toast } from 'sonner@2.0.3';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../ui/dialog';

export function BookingsManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const bookings = [
    {
      id: 'BK1001',
      client: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '+1 (555) 123-4567',
      service: 'Hair Implant',
      date: '2025-11-08',
      time: '10:00 AM',
      duration: '4-8 hours',
      status: 'confirmed',
      price: '$2,500',
      notes: 'First consultation, allergic to latex',
    },
    {
      id: 'BK1002',
      client: 'Emily Davis',
      email: 'emily@example.com',
      phone: '+1 (555) 234-5678',
      service: 'Eyebrow Implant',
      date: '2025-11-08',
      time: '02:00 PM',
      duration: '2-4 hours',
      status: 'pending',
      price: '$1,800',
      notes: 'Previous client, wants natural look',
    },
    {
      id: 'BK1003',
      client: 'Lisa Martinez',
      email: 'lisa@example.com',
      phone: '+1 (555) 345-6789',
      service: 'PRP Treatment',
      date: '2025-11-09',
      time: '11:00 AM',
      duration: '1 hour',
      status: 'confirmed',
      price: '$500',
      notes: 'Monthly session',
    },
    {
      id: 'BK1004',
      client: 'Maria Garcia',
      email: 'maria@example.com',
      phone: '+1 (555) 456-7890',
      service: 'Eyelash Implant',
      date: '2025-11-09',
      time: '03:00 PM',
      duration: '2-3 hours',
      status: 'cancelled',
      price: '$2,200',
      notes: 'Cancelled due to emergency',
    },
    {
      id: 'BK1005',
      client: 'Jennifer Lee',
      email: 'jennifer@example.com',
      phone: '+1 (555) 567-8901',
      service: 'Beard Implant',
      date: '2025-11-10',
      time: '09:00 AM',
      duration: '3-6 hours',
      status: 'confirmed',
      price: '$3,000',
      notes: 'New client, consultation completed',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleConfirm = (id: string) => {
    toast.success(`Booking ${id} confirmed successfully`);
  };

  const handleCancel = (id: string) => {
    toast.error(`Booking ${id} cancelled`);
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.service.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    { label: 'Total Bookings', value: bookings.length, color: 'from-pink-500 to-rose-600' },
    { label: 'Confirmed', value: bookings.filter((b) => b.status === 'confirmed').length, color: 'from-green-500 to-emerald-600' },
    { label: 'Pending', value: bookings.filter((b) => b.status === 'pending').length, color: 'from-yellow-500 to-orange-600' },
    { label: 'Cancelled', value: bookings.filter((b) => b.status === 'cancelled').length, color: 'from-red-500 to-rose-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-gray-900">Bookings Management</h1>
          <p className="text-gray-600">Manage all appointments and reservations</p>
        </div>
        <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl">
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
                      <p className="text-gray-900">{booking.client}</p>
                      <p className="text-gray-500">{booking.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{booking.service}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-gray-900">{booking.date}</p>
                        <p className="text-gray-500">{booking.time}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {booking.duration}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-900">{booking.price}</TableCell>
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
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {booking.status === 'pending' && (
                          <DropdownMenuItem onClick={() => handleConfirm(booking.id)}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Confirm
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleCancel(booking.id)} className="text-red-600">
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancel
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
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
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details - {selectedBooking?.id}</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 mb-1">Client Name</p>
                  <p className="text-gray-900">{selectedBooking.client}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Email</p>
                  <p className="text-gray-900">{selectedBooking.email}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Phone</p>
                  <p className="text-gray-900">{selectedBooking.phone}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Service</p>
                  <p className="text-gray-900">{selectedBooking.service}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Date</p>
                  <p className="text-gray-900">{selectedBooking.date}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Time</p>
                  <p className="text-gray-900">{selectedBooking.time}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Duration</p>
                  <p className="text-gray-900">{selectedBooking.duration}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Price</p>
                  <p className="text-gray-900">{selectedBooking.price}</p>
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
                <p className="text-gray-900">{selectedBooking.notes}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedBooking(null)}>
              Close
            </Button>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600">
              Edit Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
