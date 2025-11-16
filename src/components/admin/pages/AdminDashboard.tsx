import { motion } from 'motion/react';
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Card } from '../../ui/card';
import { useLanguage } from '../../LanguageContext';
import { Progress } from '../../ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export function AdminDashboard() {
  const { t } = useLanguage();
  const stats = [
    {
  title: t('admin.totalRevenue') || 'Total Revenue',
      value: '$125,840',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600',
    },
    {
  title: t('admin.totalBookings') || 'Total Bookings',
      value: '342',
      change: '+8.2%',
      trend: 'up',
      icon: Calendar,
      color: 'from-pink-500 to-rose-600',
    },
    {
  title: t('admin.activeClients') || 'Active Clients',
      value: '1,284',
      change: '+15.3%',
      trend: 'up',
      icon: Users,
      color: 'from-purple-500 to-violet-600',
    },
    {
  title: t('admin.successRate') || 'Success Rate',
      value: '98.4%',
      change: '+2.1%',
      trend: 'up',
      icon: TrendingUp,
      color: 'from-blue-500 to-cyan-600',
    },
  ];

  const revenueData = [
    { month: t('admin.month.jan'), revenue: 45000, bookings: 28 },
    { month: t('admin.month.feb'), revenue: 52000, bookings: 32 },
    { month: t('admin.month.mar'), revenue: 48000, bookings: 30 },
    { month: t('admin.month.apr'), revenue: 61000, bookings: 38 },
    { month: t('admin.month.may'), revenue: 55000, bookings: 34 },
    { month: t('admin.month.jun'), revenue: 67000, bookings: 42 },
  ];

  const serviceData = [
    { name: t('hairImplant'), value: 45, color: '#ec4899' },
    { name: t('eyebrowImplant') || t('eyebrow') || 'Eyebrow', value: 25, color: '#a855f7' },
    { name: t('eyelashImplant') || 'Eyelash', value: 15, color: '#3b82f6' },
    { name: 'PRP', value: 10, color: '#10b981' },
    { name: t('services.other') || 'Other', value: 5, color: '#f59e0b' },
  ];

  const recentBookings = [
    {
      id: 'BK1001',
      client: 'Sarah Johnson',
      service: t('hairImplant'),
      date: '2025-11-08',
      time: '10:00 AM',
      status: t('admin.confirmed'),
    },
    {
      id: 'BK1002',
      client: 'Emily Davis',
      service: t('eyebrowImplant'),
      date: '2025-11-08',
      time: '02:00 PM',
      status: t('admin.pending'),
    },
    {
      id: 'BK1003',
      client: 'Lisa Martinez',
      service: 'PRP',
      date: '2025-11-09',
      time: '11:00 AM',
      status: t('admin.confirmed'),
    },
    {
      id: 'BK1004',
      client: 'Maria Garcia',
      service: t('eyelashImplant'),
      date: '2025-11-09',
      time: '03:00 PM',
      status: t('admin.cancelled'),
    },
  ];

  const todayAppointments = [
    { time: '09:00 AM', client: 'Anna Wilson', service: t('admin.consultation'), status: t('admin.completed') },
    { time: '11:00 AM', client: 'Jennifer Lee', service: t('hairImplant'), status: t('admin.status.inProgress') },
    { time: '02:00 PM', client: 'Michelle Chen', service: t('admin.eyebrowDesign'), status: t('admin.status.upcoming') },
    { time: '04:00 PM', client: 'Rachel Brown', service: 'PRP', status: t('admin.status.upcoming') },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case t('admin.confirmed'):
        return 'bg-green-100 text-green-700';
      case t('admin.pending'):
        return 'bg-yellow-100 text-yellow-700';
      case t('admin.cancelled'):
        return 'bg-red-100 text-red-700';
      case t('admin.completed'):
        return 'bg-blue-100 text-blue-700';
      case t('admin.status.inProgress'):
        return 'bg-purple-100 text-purple-700';
      case t('admin.status.upcoming'):
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case t('admin.confirmed'):
      case t('admin.completed'):
        return <CheckCircle className="w-4 h-4" />;
      case t('admin.pending'):
      case t('admin.status.upcoming'):
        return <Clock className="w-4 h-4" />;
      case t('admin.cancelled'):
        return <XCircle className="w-4 h-4" />;
      case t('admin.status.inProgress'):
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
  <h1 className="mb-2 text-gray-900">{t('admin.dashboardOverview')}</h1>
  <p className="text-gray-600">{t('admin.dashboardWelcome')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  <span>{stat.change}</span>
                </div>
              </div>
              <div className="mb-1 text-gray-900">{stat.value}</div>
              <p className="text-gray-600">{stat.title}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="p-6 border-0 shadow-lg">
          <h3 className="mb-6 text-gray-900">{t('admin.revenueOverview')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="url(#colorRevenue)"
                strokeWidth={3}
                dot={{ fill: '#ec4899', r: 6 }}
              />
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Services Distribution */}
        <Card className="p-6 border-0 shadow-lg">
          <h3 className="mb-6 text-gray-900">{t('admin.servicesDistribution')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={serviceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {serviceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Today's Schedule & Recent Bookings */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <Card className="p-6 border-0 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-gray-900">{t('admin.todaysSchedule')}</h3>
            <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
              {todayAppointments.length}
            </Badge>
          </div>
          <div className="space-y-4">
            {todayAppointments.map((appointment, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl"
              >
                <div className="flex-shrink-0 w-16 text-center">
                  <p className="text-gray-900">{appointment.time}</p>
                </div>
                <div className="flex-1">
                  <p className="text-gray-900">{appointment.client}</p>
                  <p className="text-gray-600">{appointment.service}</p>
                </div>
                <Badge className={getStatusColor(appointment.status)}>
                  <span className="flex items-center gap-1">
                    {getStatusIcon(appointment.status)}
                    {appointment.status}
                  </span>
                </Badge>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Recent Bookings */}
        <Card className="p-6 border-0 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-gray-900">{t('admin.recentBookings')}</h3>
            <Button variant="ghost" className="text-pink-600 hover:text-pink-700">
              {t('admin.viewAll')}
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.table.id')}</TableHead>
                  <TableHead>{t('admin.table.client')}</TableHead>
                  <TableHead>{t('admin.table.service')}</TableHead>
                  <TableHead>{t('admin.table.status')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>{booking.id}</TableCell>
                    <TableCell>{booking.client}</TableCell>
                    <TableCell>{booking.service}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6 border-0 shadow-lg bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 text-white">
  <h3 className="mb-4 text-white">{t('admin.quickActions')}</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <Button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-0 text-white rounded-xl">
            {t('admin.newBooking')}
          </Button>
          <Button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-0 text-white rounded-xl">
            {t('admin.addClient')}
          </Button>
          <Button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-0 text-white rounded-xl">
            {t('admin.sendMessage')}
          </Button>
          <Button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-0 text-white rounded-xl">
            {t('admin.viewReports')}
          </Button>
        </div>
      </Card>
    </div>
  );
}
