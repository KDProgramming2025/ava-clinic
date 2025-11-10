import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Star, Edit, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import { Card } from '../../ui/card';
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
};

export function TestimonialsManagement() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState<{ name: string; text: string; rating: string; image: string }>({ name: '', text: '', rating: '5', image: '' });

  const fetchAll = async () => {
    try {
      setLoading(true); setError(null);
      const data = await apiFetch<Testimonial[]>('/home/testimonials');
      setItems(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load testimonials');
    } finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', text: '', rating: '5', image: '' });
    setIsDialogOpen(true);
  };
  const openEdit = (t: Testimonial) => {
    setEditing(t);
    setForm({ name: t.name, text: t.text, rating: String(t.rating), image: t.image || '' });
    setIsDialogOpen(true);
  };

  const save = async () => {
    try {
      if (!form.name.trim() || !form.text.trim()) { toast.error('Name and Text are required'); return; }
      const payload = {
        name: form.name.trim(),
        text: form.text.trim(),
        rating: parseInt(form.rating, 10),
        image: form.image.trim() || undefined,
      };
      if (editing) {
        await apiFetch(`/home/testimonials/${editing.id}`, { method: 'PUT', body: payload });
        toast.success('Testimonial updated');
      } else {
        await apiFetch('/home/testimonials', { method: 'POST', body: payload });
        toast.success('Testimonial created');
      }
      setIsDialogOpen(false); setEditing(null); await fetchAll();
    } catch (e: any) {
      toast.error(e?.message || 'Save failed');
    }
  };

  const del = async (t: Testimonial) => {
    if (!confirm(`Delete testimonial from "${t.name}"?`)) return;
    try { await apiFetch(`/home/testimonials/${t.id}`, { method: 'DELETE' }); setItems(prev => prev.filter(x => x.id !== t.id)); toast.success('Deleted'); }
    catch (e: any) { toast.error(e?.message || 'Delete failed'); }
  };

  const Stars = ({ value }: { value: number }) => (
    <div className="flex gap-1">
      {new Array(5).fill(0).map((_, i) => (
        <Star key={i} className={`w-4 h-4 ${i < value ? 'text-yellow-500 fill-yellow-400' : 'text-gray-300'}`} />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-gray-900">Testimonials</h1>
          <p className="text-gray-600">Manage patient testimonials shown on the home page</p>
        </div>
        <Button onClick={openNew} className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl">
          <Plus className="w-4 h-4 mr-2" />
          Add Testimonial
        </Button>
      </div>

      {loading && <div className="p-4 text-gray-500">Loading…</div>}
      {error && <div className="p-4 text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((t, index) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all">
                <div className="h-40 bg-gray-100 relative">
                  {t.image ? (
                    <ImageWithFallback src={t.image} alt={t.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon className="w-10 h-10" /></div>
                  )}
                  <Badge className="absolute top-2 left-2 bg-pink-500 text-white">{t.name}</Badge>
                </div>
                <div className="p-4 space-y-3">
                  <Stars value={t.rating} />
                  <p className="text-gray-700 line-clamp-3">{t.text}</p>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1 rounded-xl" onClick={() => openEdit(t)}>
                      <Edit className="w-4 h-4 mr-2" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 rounded-xl text-red-600" onClick={() => del(t)}>
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
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
            <DialogTitle>{editing ? 'Edit Testimonial' : 'Add Testimonial'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="t-name">Name*</Label>
              <Input id="t-name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} className="mt-2 rounded-xl" />
            </div>
            <div>
              <Label htmlFor="t-text">Text*</Label>
              <Textarea id="t-text" value={form.text} onChange={(e) => setForm(f => ({ ...f, text: e.target.value }))} className="mt-2 rounded-xl" rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="t-rating">Rating (1-5)*</Label>
                <Input id="t-rating" value={form.rating} onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9]/g, '').slice(0,1);
                  setForm(f => ({ ...f, rating: v }));
                }} className="mt-2 rounded-xl" placeholder="5" />
              </div>
              <div>
                <Label htmlFor="t-image">Image URL</Label>
                <Input id="t-image" value={form.image} onChange={(e) => setForm(f => ({ ...f, image: e.target.value }))} className="mt-2 rounded-xl" placeholder="https://..." />
              </div>
            </div>
            {form.image && <img src={form.image} alt="preview" className="mt-2 h-28 w-full object-cover rounded-xl border" />}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsDialogOpen(false); setEditing(null); }}>Cancel</Button>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600" onClick={save}>{editing ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TestimonialsManagement;
