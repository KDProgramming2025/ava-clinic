import { useState } from 'react';
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

export function ClientsManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const clients = [
    {
      id: 'C001',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '+1 (555) 123-4567',
      joinDate: '2024-03-15',
      totalBookings: 5,
      totalSpent: '$12,500',
      status: 'active',
      lastVisit: '2025-10-28',
    },
    {
      id: 'C002',
      name: 'Emily Davis',
      email: 'emily@example.com',
      phone: '+1 (555) 234-5678',
      joinDate: '2024-06-20',
      totalBookings: 3,
      totalSpent: '$5,400',
      status: 'active',
      lastVisit: '2025-10-15',
    },
    {
      id: 'C003',
      name: 'Lisa Martinez',
      email: 'lisa@example.com',
      phone: '+1 (555) 345-6789',
      joinDate: '2023-12-10',
      totalBookings: 12,
      totalSpent: '$18,900',
      status: 'vip',
      lastVisit: '2025-11-01',
    },
    {
      id: 'C004',
      name: 'Maria Garcia',
      email: 'maria@example.com',
      phone: '+1 (555) 456-7890',
      joinDate: '2025-01-05',
      totalBookings: 1,
      totalSpent: '$2,200',
      status: 'new',
      lastVisit: '2025-01-05',
    },
    {
      id: 'C005',
      name: 'Jennifer Lee',
      email: 'jennifer@example.com',
      phone: '+1 (555) 567-8901',
      joinDate: '2024-08-12',
      totalBookings: 7,
      totalSpent: '$15,200',
      status: 'active',
      lastVisit: '2025-10-20',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'vip':
        return 'bg-purple-100 text-purple-700';
      case 'new':
        return 'bg-blue-100 text-blue-700';
      case 'inactive':
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

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || client.status === filterType;
    return matchesSearch && matchesType;
  });

  const stats = [
    { label: 'Total Clients', value: clients.length, color: 'from-pink-500 to-rose-600' },
    { label: 'Active', value: clients.filter((c) => c.status === 'active').length, color: 'from-green-500 to-emerald-600' },
    { label: 'VIP', value: clients.filter((c) => c.status === 'vip').length, color: 'from-purple-500 to-violet-600' },
    { label: 'New This Month', value: clients.filter((c) => c.status === 'new').length, color: 'from-blue-500 to-cyan-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-gray-900">Clients Management</h1>
          <p className="text-gray-600">Manage all client information and history</p>
        </div>
        <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Client
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
                placeholder="Search by name, email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full md:w-48 rounded-xl">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="vip">VIP</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="rounded-xl">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </Card>

      {/* Clients Table */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                      {client.joinDate}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-900">{client.totalBookings}</TableCell>
                  <TableCell className="text-gray-900">{client.totalSpent}</TableCell>
                  <TableCell className="text-gray-600">{client.lastVisit}</TableCell>
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
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="w-4 h-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Calendar className="w-4 h-4 mr-2" />
                          Book Appointment
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
    </div>
  );
}
