import { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Plus, Edit, Trash2, Mail, Phone, Award, UserPlus } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Avatar, AvatarFallback } from '../../ui/avatar';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { toast } from 'sonner@2.0.3';

export function TeamManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);

  const team = [
    {
      id: 'T001',
      name: 'Dr. Sarah Anderson',
      role: 'Chief Medical Director',
      specialization: 'Hair Transplantation',
      email: 'sarah.anderson@beautyimplant.com',
      phone: '+1 (555) 111-1111',
      experience: '15+ years',
      status: 'active',
      patientsServed: 2500,
    },
    {
      id: 'T002',
      name: 'Dr. Emily Roberts',
      role: 'Senior Specialist',
      specialization: 'Eyebrow & Eyelash Implants',
      email: 'emily.roberts@beautyimplant.com',
      phone: '+1 (555) 222-2222',
      experience: '12+ years',
      status: 'active',
      patientsServed: 1800,
    },
    {
      id: 'T003',
      name: 'Dr. Lisa Chen',
      role: 'Lead Consultant',
      specialization: 'PRP & Regenerative Treatments',
      email: 'lisa.chen@beautyimplant.com',
      phone: '+1 (555) 333-3333',
      experience: '10+ years',
      status: 'active',
      patientsServed: 1500,
    },
    {
      id: 'T004',
      name: 'Dr. Maria Garcia',
      role: 'Aesthetic Specialist',
      specialization: 'Advanced Aesthetic Procedures',
      email: 'maria.garcia@beautyimplant.com',
      phone: '+1 (555) 444-4444',
      experience: '8+ years',
      status: 'active',
      patientsServed: 1200,
    },
    {
      id: 'T005',
      name: 'Nurse Jennifer White',
      role: 'Senior Nurse',
      specialization: 'Post-Operative Care',
      email: 'jennifer.white@beautyimplant.com',
      phone: '+1 (555) 555-5555',
      experience: '7+ years',
      status: 'active',
      patientsServed: 3000,
    },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const handleDelete = (id: string, name: string) => {
    toast.error(`Team member "${name}" removed`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-gray-900">Team Management</h1>
          <p className="text-gray-600">Manage staff members and specialists</p>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Team Member
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Team Members', value: team.length, color: 'from-pink-500 to-rose-600' },
          { label: 'Doctors', value: team.filter((m) => m.role.includes('Dr.')).length, color: 'from-purple-500 to-violet-600' },
          { label: 'Active', value: team.filter((m) => m.status === 'active').length, color: 'from-green-500 to-emerald-600' },
          { label: 'Total Patients Served', value: team.reduce((acc, m) => acc + m.patientsServed, 0).toLocaleString(), color: 'from-blue-500 to-cyan-600' },
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

      {/* Team Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all">
              <div className="text-center mb-4">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white text-xl">
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-gray-900 mb-1">{member.name}</h3>
                <p className="text-pink-600 mb-2">{member.role}</p>
                <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-0">
                  {member.specialization}
                </Badge>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4 text-pink-500 flex-shrink-0" />
                  <span className="truncate">{member.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  <span>{member.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Award className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span>{member.experience} experience</span>
                </div>
              </div>

              <div className="p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl mb-4">
                <p className="text-gray-600 text-center">
                  <span className="text-gray-900">{member.patientsServed}</span> patients served
                </p>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600">Status</span>
                <Badge className="bg-green-100 text-green-700">
                  {member.status}
                </Badge>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-xl"
                  onClick={() => setEditingMember(member)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-xl text-red-600 hover:bg-red-50"
                  onClick={() => handleDelete(member.id, member.name)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Team Member Dialog */}
      <Dialog open={isAddDialogOpen || !!editingMember} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false);
          setEditingMember(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingMember ? 'Edit Team Member' : 'Add New Team Member'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="member-name">Full Name*</Label>
              <Input
                id="member-name"
                placeholder="e.g., Dr. Jane Smith"
                defaultValue={editingMember?.name}
                className="mt-2 rounded-xl"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="member-role">Role*</Label>
                <Select defaultValue={editingMember?.role}>
                  <SelectTrigger className="mt-2 rounded-xl">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Chief Medical Director">Chief Medical Director</SelectItem>
                    <SelectItem value="Senior Specialist">Senior Specialist</SelectItem>
                    <SelectItem value="Lead Consultant">Lead Consultant</SelectItem>
                    <SelectItem value="Aesthetic Specialist">Aesthetic Specialist</SelectItem>
                    <SelectItem value="Senior Nurse">Senior Nurse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="member-experience">Experience*</Label>
                <Input
                  id="member-experience"
                  placeholder="e.g., 10+ years"
                  defaultValue={editingMember?.experience}
                  className="mt-2 rounded-xl"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="member-specialization">Specialization*</Label>
              <Input
                id="member-specialization"
                placeholder="e.g., Hair Transplantation"
                defaultValue={editingMember?.specialization}
                className="mt-2 rounded-xl"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="member-email">Email*</Label>
                <Input
                  id="member-email"
                  type="email"
                  placeholder="email@beautyimplant.com"
                  defaultValue={editingMember?.email}
                  className="mt-2 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="member-phone">Phone*</Label>
                <Input
                  id="member-phone"
                  placeholder="+1 (555) 000-0000"
                  defaultValue={editingMember?.phone}
                  className="mt-2 rounded-xl"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                setEditingMember(null);
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-pink-500 to-purple-600"
              onClick={() => {
                toast.success(editingMember ? 'Team member updated!' : 'Team member added!');
                setIsAddDialogOpen(false);
                setEditingMember(null);
              }}
            >
              {editingMember ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
