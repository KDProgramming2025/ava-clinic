import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Briefcase, Plus, Edit, Trash2, DollarSign, Clock, Image as ImageIcon } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
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
import { toast } from 'sonner';
import { apiFetch } from '../../../api/client';

type Service = {
  id: string;
  title: string;
  subtitle?: string | null;
  slug: string;
  description: string;
  image?: string | null;
  priceRange?: string | null;
  duration?: string | null;
  recovery?: string | null;
  createdAt?: string;
  benefits?: { id: string; text: string }[];
  processSteps?: { id: string; stepNumber: number; title?: string | null; description: string }[];
  faq?: { id: string; question: string; answer: string }[];
};

export function ServicesManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<Service>>({
    title: '',
    subtitle: '',
    slug: '',
    description: '',
    image: '',
    priceRange: '',
    duration: '',
    recovery: '',
  });
  const [benefits, setBenefits] = useState<{ text: string }[]>([]);
  const [steps, setSteps] = useState<{ stepNumber?: number; title?: string; description: string }[]>([]);
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiFetch<Service[]>('/services');
      setServices(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openAddDialog = () => {
    setEditingService(null);
    setForm({ title: '', subtitle: '', slug: '', description: '', image: '', priceRange: '', duration: '', recovery: '' });
    setBenefits([]);
    setSteps([]);
    setFaqs([]);
    setIsDialogOpen(true);
  };

  const openEditDialog = (svc: Service) => {
    setEditingService(svc);
    setForm({
      title: svc.title,
      subtitle: svc.subtitle || '',
      slug: svc.slug,
      description: svc.description,
      image: svc.image || '',
      priceRange: svc.priceRange || '',
      duration: svc.duration || '',
      recovery: svc.recovery || '',
    });
    setBenefits((svc.benefits || []).map(b => ({ text: b.text })));
    setSteps((svc.processSteps || []).sort((a,b)=>a.stepNumber-b.stepNumber).map(s => ({ stepNumber: s.stepNumber, title: s.title || '', description: s.description })));
    setFaqs((svc.faq || []).map(f => ({ question: f.question, answer: f.answer })));
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        title: form.title?.trim(),
        subtitle: form.subtitle?.trim() || undefined,
        slug: form.slug?.trim(),
        description: form.description?.trim(),
        image: form.image?.trim() || undefined,
        priceRange: form.priceRange?.trim() || undefined,
        duration: form.duration?.trim() || undefined,
        recovery: form.recovery?.trim() || undefined,
        benefits: benefits.filter(b => b.text?.trim()).map(b => ({ text: b.text.trim() })),
        processSteps: steps.filter(s => s.description?.trim()).map((s, idx) => ({ stepNumber: s.stepNumber ?? idx + 1, title: s.title?.trim() || undefined, description: s.description.trim() })),
        faq: faqs.filter(f => f.question?.trim() && f.answer?.trim()).map(f => ({ question: f.question.trim(), answer: f.answer.trim() })),
      };
      if (!payload.title || !payload.slug || !payload.description) {
        toast.error('Please fill required fields: Title, Slug, Description');
        return;
      }
      if (editingService) {
        await apiFetch(`/services/${editingService.id}`, { method: 'PUT', body: payload });
        toast.success('Service updated');
      } else {
        await apiFetch('/services', { method: 'POST', body: payload });
        toast.success('Service created');
      }
      setIsDialogOpen(false);
      setEditingService(null);
      await fetchServices();
    } catch (e: any) {
      if (e?.code === 'slug_conflict') toast.error('Slug already exists');
      else toast.error(e?.message || 'Save failed');
    }
  };

  const handleDelete = async (svc: Service) => {
    if (!confirm(`Delete service "${svc.title}"?`)) return;
    try {
      await apiFetch(`/services/${svc.id}`, { method: 'DELETE' });
      toast.success('Service deleted');
      setServices(prev => prev.filter(s => s.id !== svc.id));
    } catch (e: any) {
      toast.error(e?.message || 'Delete failed');
    }
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
          onClick={openAddDialog}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Services', value: services.length, color: 'from-pink-500 to-rose-600' },
          { label: 'With Price Range', value: services.filter((s) => !!s.priceRange).length, color: 'from-purple-500 to-violet-600' },
          { label: 'With Duration', value: services.filter((s) => !!s.duration).length, color: 'from-blue-500 to-cyan-600' },
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
      {loading && (
        <div className="p-6 text-gray-500">Loading services…</div>
      )}
      {error && (
        <div className="p-6 text-red-600">{error}</div>
      )}
      {!loading && !error && (
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
                  <h3 className="mb-1 text-gray-900">{service.title}</h3>
                  {service.subtitle && <p className="text-gray-500 mb-1">{service.subtitle}</p>}
                  <p className="text-gray-600 mb-4 line-clamp-3">{service.description}</p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign className="w-4 h-4 text-pink-500" />
                    <span>Price Range</span>
                  </div>
                  <span className="text-gray-900">{service.priceRange || '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <span>Duration</span>
                  </div>
                  <span className="text-gray-900">{service.duration || '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Briefcase className="w-4 h-4 text-blue-500" />
                    <span>Recovery</span>
                  </div>
                  <span className="text-gray-900">{service.recovery || '-'}</span>
                </div>
              </div>
              <Badge className="bg-gray-100 text-gray-700">Slug: {service.slug}</Badge>

              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-xl"
                  onClick={() => openEditDialog(service)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-xl text-red-600 hover:bg-red-50"
                  onClick={() => handleDelete(service)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
      )}

      {/* Add/Edit Service Dialog */}
  <Dialog open={isDialogOpen} onOpenChange={(open: boolean) => {
        if (!open) {
          setIsDialogOpen(false);
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
                value={form.title || ''}
                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                className="mt-2 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="service-subtitle">Subtitle</Label>
              <Input
                id="service-subtitle"
                placeholder="Short subheading"
                value={form.subtitle || ''}
                onChange={(e) => setForm(f => ({ ...f, subtitle: e.target.value }))}
                className="mt-2 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="service-desc">Description*</Label>
              <Textarea
                id="service-desc"
                placeholder="Describe the service..."
                value={form.description || ''}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                className="mt-2 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="service-slug">Slug*</Label>
              <Input
                id="service-slug"
                placeholder="hair-implant"
                value={form.slug || ''}
                onChange={(e) => setForm(f => ({ ...f, slug: e.target.value.replace(/\s+/g, '-').toLowerCase() }))}
                className="mt-2 rounded-xl"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="service-price">Starting Price*</Label>
                <Input
                  id="service-price"
                  placeholder="$0"
                  value={form.priceRange || ''}
                  onChange={(e) => setForm(f => ({ ...f, priceRange: e.target.value }))}
                  className="mt-2 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="service-duration">Duration*</Label>
                <Input
                  id="service-duration"
                  placeholder="e.g., 2-4 hours"
                  value={form.duration || ''}
                  onChange={(e) => setForm(f => ({ ...f, duration: e.target.value }))}
                  className="mt-2 rounded-xl"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="service-recovery">Recovery Time*</Label>
              <Input
                id="service-recovery"
                placeholder="e.g., 5-7 days"
                value={form.recovery || ''}
                onChange={(e) => setForm(f => ({ ...f, recovery: e.target.value }))}
                className="mt-2 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="service-image">Image URL</Label>
              <div className="relative mt-2 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-gray-400" />
                <Input
                  id="service-image"
                  placeholder="https://..."
                  value={form.image || ''}
                  onChange={(e) => setForm(f => ({ ...f, image: e.target.value }))}
                  className="rounded-xl"
                />
              </div>
              {form.image && (
                <img src={form.image} alt="preview" className="mt-3 h-24 w-full object-cover rounded-xl border" />
              )}
            </div>
            {/* Nested Editors */}
            <div className="pt-4 border-t border-gray-200 space-y-6">
              <div>
                <Label>Benefits</Label>
                <div className="mt-2 space-y-2">
                  {benefits.map((b, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        value={b.text}
                        onChange={(e) => setBenefits(arr => arr.map((x,i)=> i===idx? { text: e.target.value }: x))}
                        placeholder="Benefit text"
                        className="flex-1 rounded-xl"
                      />
                      <Button variant="outline" size="sm" className="rounded-xl text-red-600 hover:bg-red-50" onClick={() => setBenefits(arr => arr.filter((_,i)=>i!==idx))}>✕</Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setBenefits(arr => [...arr,{ text: '' }])}>Add Benefit</Button>
                </div>
              </div>
              <div>
                <Label>Process Steps</Label>
                <div className="mt-2 space-y-3">
                  {steps.map((s, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-gray-50 space-y-2">
                      <div className="grid md:grid-cols-5 gap-2">
                        <Input
                          type="number"
                          value={s.stepNumber ?? idx + 1}
                          onChange={(e) => setSteps(arr => arr.map((x,i)=> i===idx? { ...x, stepNumber: parseInt(e.target.value)||idx+1 }: x))}
                          className="md:col-span-1 rounded-xl"
                          placeholder="#"
                        />
                        <Input
                          value={s.title || ''}
                          onChange={(e) => setSteps(arr => arr.map((x,i)=> i===idx? { ...x, title: e.target.value }: x))}
                          className="md:col-span-2 rounded-xl"
                          placeholder="Title (optional)"
                        />
                        <Textarea
                          value={s.description}
                          onChange={(e) => setSteps(arr => arr.map((x,i)=> i===idx? { ...x, description: e.target.value }: x))}
                          className="md:col-span-2 rounded-xl"
                          placeholder="Description*"
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm" className="rounded-xl text-red-600 hover:bg-red-50" onClick={() => setSteps(arr => arr.filter((_,i)=>i!==idx))}>Remove</Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setSteps(arr => [...arr,{ description: '' }])}>Add Step</Button>
                </div>
              </div>
              <div>
                <Label>FAQ</Label>
                <div className="mt-2 space-y-3">
                  {faqs.map((f, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-gray-50 space-y-2">
                      <Input
                        value={f.question}
                        onChange={(e) => setFaqs(arr => arr.map((x,i)=> i===idx? { ...x, question: e.target.value }: x))}
                        placeholder="Question*"
                        className="rounded-xl"
                      />
                      <Textarea
                        value={f.answer}
                        onChange={(e) => setFaqs(arr => arr.map((x,i)=> i===idx? { ...x, answer: e.target.value }: x))}
                        placeholder="Answer*"
                        className="rounded-xl"
                      />
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm" className="rounded-xl text-red-600 hover:bg-red-50" onClick={() => setFaqs(arr => arr.filter((_,i)=>i!==idx))}>Remove</Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setFaqs(arr => [...arr,{ question: '', answer: '' }])}>Add FAQ</Button>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setEditingService(null);
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-pink-500 to-purple-600"
              onClick={handleSave}
            >
              {editingService ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
