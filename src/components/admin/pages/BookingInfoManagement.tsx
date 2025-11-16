import { useEffect, useState } from 'react';
import { useLanguage } from '../../LanguageContext';
import { motion } from 'motion/react';
import { Plus, Save, Trash2, GripVertical } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { toast } from 'sonner';
import { api } from '../../../api/client';

interface BookingInfoItem { id: string; title: string; description?: string|null; icon?: string|null; order: number; }

export default function BookingInfoManagement() {
  const { t } = useLanguage();
  const [items, setItems] = useState<BookingInfoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await api.bookingInfo();
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
  toast.error(e?.message || t('admin.failedToLoad') || 'Failed to load booking info');
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    try {
      const created = await api.createBookingInfo({ title: 'New card', description: '', icon: '', order: items.length });
      setItems(prev => [...prev, created]);
  } catch (e: any) { toast.error(e?.message || t('admin.bookingInfo.createFailed')); }
  };
  const update = async (id: string, patch: Partial<BookingInfoItem>) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, ...patch } : it));
  };
  const persist = async (id: string) => {
    try {
      const item = items.find(x => x.id === id);
      if (!item) return;
      await api.updateBookingInfo(id, { title: item.title, description: item.description || '', icon: item.icon || '', order: item.order });
      toast.success(t('admin.bookingInfo.saved'));
    } catch (e: any) { toast.error(e?.message || t('admin.bookingInfo.saveFailed')); }
  };
  const remove = async (id: string) => {
  try { await api.deleteBookingInfo(id); setItems(prev => prev.filter(x => x.id !== id)); }
  catch (e: any) { toast.error(e?.message || t('admin.bookingInfo.deleteFailed')); }
  };
  const reorder = async (from: number, to: number) => {
    const arr = [...items];
    const [moved] = arr.splice(from, 1);
    arr.splice(to, 0, moved);
    const reindexed = arr.map((it, i) => ({ ...it, order: i }));
    setItems(reindexed);
    try {
      setSaving(true);
      await api.reorderBookingInfo(reindexed.map(it => ({ id: it.id, order: it.order })));
      toast.success(t('admin.bookingInfo.orderUpdated'));
    } catch (e: any) { toast.error(e?.message || t('admin.bookingInfo.reorderFailed')); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
  <h1 className="text-gray-900">{t('admin.bookingInfo')}</h1>
        <div className="flex gap-2">
          <Button onClick={add} className="rounded-xl"><Plus className="w-4 h-4 mr-2"/>{t('admin.bookingInfo.addCard')}</Button>
          <Button onClick={load} variant="outline" className="rounded-xl">{t('admin.bookingInfo.reload')}</Button>
        </div>
      </div>

      {loading ? (
        <div className="p-4 text-gray-500">{t('common.loading')}</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((it, idx) => (
            <motion.div key={it.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-500">
                    <GripVertical className="w-4 h-4" />
                    <span className="text-xs">#{idx+1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => persist(it.id)} className="rounded-md"><Save className="w-4 h-4"/></Button>
                    <Button size="sm" variant="outline" onClick={() => remove(it.id)} className="rounded-md text-red-600"><Trash2 className="w-4 h-4"/></Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">{t('admin.bookingInfo.iconLabel')}</label>
                  <Input value={it.icon || ''} onChange={(e)=> update(it.id, { icon: e.target.value })} className="mt-1"/>
                </div>
                <div>
                  <label className="text-sm text-gray-600">{t('admin.bookingInfo.titleLabel')}</label>
                  <Input value={it.title} onChange={(e)=> update(it.id, { title: e.target.value })} className="mt-1"/>
                </div>
                <div>
                  <label className="text-sm text-gray-600">{t('admin.bookingInfo.descriptionLabel')}</label>
                  <Textarea rows={3} value={it.description || ''} onChange={(e)=> update(it.id, { description: e.target.value })} className="mt-1"/>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600">{t('admin.bookingInfo.orderLabel')}</label>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" disabled={idx===0 || saving} onClick={()=> reorder(idx, idx-1)}>{t('admin.bookingInfo.up')}</Button>
                    <Button size="sm" variant="outline" disabled={idx===items.length-1 || saving} onClick={()=> reorder(idx, idx+1)}>{t('admin.bookingInfo.down')}</Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
