import { useState } from 'react';
import { motion } from 'motion/react';
import { Briefcase, Plus, Edit, Trash2, Eye, DollarSign, Clock } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Switch } from '../../ui/switch';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../ui/dialog';
import { toast } from 'sonner@2.0.3';

export function ServicesManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);

  const services = [
    {
      id: 'S001',
      name: 'Hair Implant (FUE)',
      description: 'Advanced Follicular Unit Extraction technique for natural hair restoration',
      price: '$2,500',
      priceRange: '$2,500 - $8,000',
      duration: '4-8 hours',
      recovery: '7-10 days',
      active: true,
      popularity: 85,
      totalBookings: 142,
    },
    {
      id: 'S002',
      name: 'Eyebrow Implant',
      description: 'Precision eyebrow implant for perfect shape and natural fullness',
      price: '$1,800',
      priceRange: '$1,800 - $3,500',
      duration: '2-4 hours',
      recovery: '5-7 days',
      active: true,
      popularity: 72,
      totalBookings: 98,
    },
    {
      id: 'S003',
      name: 'Eyelash Implant',
      description: 'Beautiful, natural eyelashes that enhance your eyes permanently',
      price: '$2,200',
      priceRange: '$2,200 - $4,000',
      duration: '2-3 hours',
      recovery: '5-7 days',
      active: true,
      popularity: 65,
      totalBookings: 76,
    },
    {
      id: 'S004',
      name: 'Beard Implant',
      description: 'Achieve the perfect beard style with natural hair implantation',
      price: '$3,000',
      priceRange: '$3,000 - $6,000',
      duration: '3-6 hours',
      recovery: '7-10 days',
      active: true,
      popularity: 58,
      totalBookings: 54,
    },
    {
      id: 'S005',
      name: 'PRP Treatment',
      description: 'Platelet-Rich Plasma therapy to stimulate natural hair growth',
      price: '$500',
      priceRange: '$500 - $800',
      duration: '1 hour',
      recovery: 'Same day',
      active: true,
      popularity: 78,
      totalBookings: 124,
    },
    {
      id: 'S006',
      name: 'Mesotherapy',
      description: 'Nutrient-rich injections to nourish and strengthen hair follicles',
      price: '$400',
      priceRange: '$400 - $600',
      duration: '30-45 min',
      recovery: 'Immediate',
      active: true,
      popularity: 68,
      totalBookings: 89,
    },
  ];

  const handleToggleActive = (id: string) => {
    toast.success('Service status updated');
  };

  const handleDelete = (id: string, name: string) => {
    toast.error(`Service "${name}" deleted`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-gray-900">Services Management</h1>
          <p className="text-gray-600">Manage all services and procedures</p>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Services', value: services.length, color: 'from-pink-500 to-rose-600' },
          { label: 'Active', value: services.filter((s) => s.active).length, color: 'from-green-500 to-emerald-600' },
          { label: 'Total Bookings', value: services.reduce((acc, s) => acc + s.totalBookings, 0), color: 'from-purple-500 to-violet-600' },
          { label: 'Avg. Popularity', value: `${Math.round(services.reduce((acc, s) => acc + s.popularity, 0) / services.length)}%`, color: 'from-blue-500 to-cyan-600' },
        ].map((stat, index) => (
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

      {/* Services Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="mb-2 text-gray-900">{service.name}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                </div>
                <Switch
                  checked={service.active}
                  onCheckedChange={() => handleToggleActive(service.id)}
                />
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign className="w-4 h-4 text-pink-500" />
                    <span>Price Range</span>
                  </div>
                  <span className="text-gray-900">{service.priceRange}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <span>Duration</span>
                  </div>
                  <span className="text-gray-900">{service.duration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Briefcase className="w-4 h-4 text-blue-500" />
                    <span>Bookings</span>
                  </div>
                  <span className="text-gray-900">{service.totalBookings}</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Popularity</span>
                  <span className="text-gray-900">{service.popularity}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${service.popularity}%` }}
                    transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-pink-500 to-purple-600"
                  />
                </div>
              </div>

              <Badge className={service.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                {service.active ? 'Active' : 'Inactive'}
              </Badge>

              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-xl"
                  onClick={() => setEditingService(service)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-xl text-red-600 hover:bg-red-50"
                  onClick={() => handleDelete(service.id, service.name)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Service Dialog */}
      <Dialog open={isAddDialogOpen || !!editingService} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false);
          setEditingService(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingService ? 'Edit Service' : 'Add New Service'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="service-name">Service Name*</Label>
              <Input
                id="service-name"
                placeholder="e.g., Hair Implant"
                defaultValue={editingService?.name}
                className="mt-2 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="service-desc">Description*</Label>
              <Textarea
                id="service-desc"
                placeholder="Describe the service..."
                defaultValue={editingService?.description}
                className="mt-2 rounded-xl"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="service-price">Starting Price*</Label>
                <Input
                  id="service-price"
                  placeholder="$0"
                  defaultValue={editingService?.price}
                  className="mt-2 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="service-duration">Duration*</Label>
                <Input
                  id="service-duration"
                  placeholder="e.g., 2-4 hours"
                  defaultValue={editingService?.duration}
                  className="mt-2 rounded-xl"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="service-recovery">Recovery Time*</Label>
              <Input
                id="service-recovery"
                placeholder="e.g., 5-7 days"
                defaultValue={editingService?.recovery}
                className="mt-2 rounded-xl"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="service-active">Active Status</Label>
              <Switch id="service-active" defaultChecked={editingService?.active ?? true} />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                setEditingService(null);
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-pink-500 to-purple-600"
              onClick={() => {
                toast.success(editingService ? 'Service updated!' : 'Service added!');
                setIsAddDialogOpen(false);
                setEditingService(null);
              }}
            >
              {editingService ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
