import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Card } from '../../ui/card';
import { useLanguage } from '../../LanguageContext';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { toast } from 'sonner';
import { apiFetch } from '../../../api/client';
import { ImageWithFallback } from '../../figma/ImageWithFallback';

 type Testimonial = {
  id: string;
  name: string;
  text: string;
  rating: number;
  image?: string | null;
  createdAt?: string;
  nameEn?: string | null;
  nameFa?: string | null;
  textEn?: string | null;
  textFa?: string | null;
};

export function TestimonialsManagement() {
  const { t: translate } = useLanguage();
  const tr = (key: string) => (typeof translate === 'function' ? translate(key) : key);
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState<{ nameEn: string; nameFa: string; textEn: string; textFa: string; rating: string; image: string }>({ nameEn: '', nameFa: '', textEn: '', textFa: '', rating: '5', image: '' });

  const fetchAll = async () => {
    try {
      setLoading(true); setError(null);
  const data = await apiFetch<Testimonial[]>('/testimonials');
      setItems(data);
    } catch (e: any) {
  setError(e?.message || tr('admin.saveFailed'));
    } finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ nameEn: '', nameFa: '', textEn: '', textFa: '', rating: '5', image: '' });
    setIsDialogOpen(true);
  };
  const openEdit = (testi: Testimonial) => {
    setEditing(testi);
    setForm({
      nameEn: (testi as any).nameEn || testi.name,
      nameFa: (testi as any).nameFa || testi.name,
      textEn: (testi as any).textEn || testi.text,
      textFa: (testi as any).textFa || testi.text,
      rating: String(testi.rating),
      image: testi.image || '',
    });
    setIsDialogOpen(true);
  };

  const save = async () => {
    try {
  if ((!form.nameEn.trim() && !form.nameFa.trim()) || (!form.textEn.trim() && !form.textFa.trim())) { toast.error(tr('admin.nameTextRequired')); return; }
      const payload = {
        nameEn: form.nameEn.trim() || undefined,
        nameFa: form.nameFa.trim() || undefined,
        textEn: form.textEn.trim() || undefined,
        textFa: form.textFa.trim() || undefined,
        name: form.nameFa.trim() || form.nameEn.trim(),
        text: form.textFa.trim() || form.textEn.trim(),
        rating: parseInt(form.rating, 10),
        image: form.image.trim() || undefined,
      };
      if (editing) {
    await apiFetch(`/testimonials/${editing.id}`, { method: 'PUT', body: payload });
  toast.success(tr('admin.testimonialUpdated'));
      } else {
    await apiFetch('/testimonials', { method: 'POST', body: payload });
  toast.success(tr('admin.testimonialCreated'));
      }
      setIsDialogOpen(false); setEditing(null); await fetchAll();
    } catch (e: any) {
  toast.error(e?.message || tr('admin.saveFailed'));
    }
  };

  const del = async (item: Testimonial) => {
  if (!confirm(`${tr('admin.deleteTestimonialConfirm')} "${item.name}"?`)) return;
  try { await apiFetch(`/testimonials/${item.id}`, { method: 'DELETE' }); setItems(prev => prev.filter(x => x.id !== item.id)); toast.success(tr('admin.deleted')); }
  catch (e: any) { toast.error(e?.message || tr('admin.deleteFailed')); }
  };

  const Stars = ({ value }: { value: number }) => {
    const v = Math.max(0, Math.min(5, Number(value) || 0));
    return (
      <div className="flex gap-1" aria-label={`${v} / 5`}>
        {new Array(5).fill(0).map((_, i) => (
          <span key={i} className={`text-base leading-none ${i < v ? 'text-yellow-500' : 'text-gray-300'}`} aria-hidden="true">{i < v ? '★' : '☆'}</span>
        ))}
      </div>
    );
  };

  // Precompute static labels defensively to avoid inline function calls in JSX
  const L = {
    manageTitle: tr('admin.testimonialsManagement'),
    manageSubtitle: tr('admin.testimonialsSubtitle'),
    addAction: tr('admin.addTestimonialAction'),
    loading: tr('common.loading'),
    edit: tr('admin.edit'),
    del: tr('admin.delete'),
    editDialogTitle: tr('admin.editTestimonial'),
    addDialogTitle: tr('admin.addTestimonial'),
    name: tr('admin.name'),
    text: tr('admin.text'),
    rating: tr('admin.ratingLabel'),
    imageUrl: tr('admin.imageUrl'),
    cancel: tr('admin.cancel'),
    update: tr('admin.update'),
    create: tr('admin.create'),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-gray-900">{L.manageTitle}</h1>
          <p className="text-gray-600">{L.manageSubtitle}</p>
        </div>
        <Button onClick={openNew} className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl">
          <span className="w-4 h-4 mr-2" aria-hidden="true">＋</span>
          {L.addAction}
        </Button>
      </div>

  {loading && <div className="p-4 text-gray-500">{L.loading}</div>}
      {error && <div className="p-4 text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all">
                <div className="h-40 bg-gray-100 relative">
                  {item.image ? (
                    <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400" aria-hidden="true"><span className="text-4xl">🖼️</span></div>
                  )}
                  <Badge className="absolute top-2 left-2 bg-pink-500 text-white">{item.name}</Badge>
                </div>
                <div className="p-4 space-y-3">
                  <Stars value={item.rating} />
                  <p className="text-gray-700 line-clamp-3">{item.text}</p>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1 rounded-xl" onClick={() => openEdit(item)}>
                        <span className="mr-2" aria-hidden="true">✎</span> {L.edit}
                    </Button>
                      <Button variant="outline" size="sm" className="flex-1 rounded-xl text-red-600" onClick={() => del(item)}>
                        <span className="mr-2" aria-hidden="true">🗑️</span> {L.del}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

  <Dialog open={isDialogOpen} onOpenChange={(o: boolean) => { if (!o) { setIsDialogOpen(false); setEditing(null); } }}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? L.editDialogTitle : L.addDialogTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="t-name-en">{L.name} (EN)*</Label>
                <Input id="t-name-en" value={form.nameEn} onChange={(e) => setForm(f => ({ ...f, nameEn: e.target.value }))} className="mt-2 rounded-xl" />
              </div>
              <div>
                <Label htmlFor="t-name-fa">{L.name} (FA)*</Label>
                <Input id="t-name-fa" value={form.nameFa} onChange={(e) => setForm(f => ({ ...f, nameFa: e.target.value }))} className="mt-2 rounded-xl text-right" dir="rtl" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="t-text-en">{L.text} (EN)*</Label>
                <Textarea id="t-text-en" value={form.textEn} onChange={(e) => setForm(f => ({ ...f, textEn: e.target.value }))} className="mt-2 rounded-xl" rows={4} />
              </div>
              <div>
                <Label htmlFor="t-text-fa">{L.text} (FA)*</Label>
                <Textarea id="t-text-fa" value={form.textFa} onChange={(e) => setForm(f => ({ ...f, textFa: e.target.value }))} className="mt-2 rounded-xl text-right" rows={4} dir="rtl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="t-rating">{L.rating}</Label>
                <Input id="t-rating" value={form.rating} onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9]/g, '').slice(0,1);
                  setForm(f => ({ ...f, rating: v }));
                }} className="mt-2 rounded-xl" placeholder="5" />
              </div>
              <div>
                <Label htmlFor="t-image">{L.imageUrl}</Label>
                <Input id="t-image" value={form.image} onChange={(e) => setForm(f => ({ ...f, image: e.target.value }))} className="mt-2 rounded-xl" placeholder="https://..." />
              </div>
            </div>
            {form.image && <img src={form.image} alt="preview" className="mt-2 h-28 w-full object-cover rounded-xl border" />}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsDialogOpen(false); setEditing(null); }}>{L.cancel}</Button>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600" onClick={save}>{editing ? L.update : L.create}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TestimonialsManagement;
