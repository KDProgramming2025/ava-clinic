import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Save, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, Link as LinkIcon } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Checkbox } from '../../ui/checkbox';
import { toast } from 'sonner';
import { apiFetch } from '../../../api/client';

interface NavItem { id?: string; label: string; path: string; order: number; visible: boolean; }

export default function NavigationManagement() {
  const [items, setItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<any>('/settings');
      const nav = Array.isArray(data?.navigation) ? data.navigation : [];
      // Ensure order
      const normalized = nav.map((n: any, i: number) => ({ id: n.id, label: n.label || '', path: n.path || '/', order: n.order ?? i, visible: n.visible ?? true }))
        .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
      setItems(normalized);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load navigation');
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const add = () => {
    setItems(prev => [...prev, { label: 'New', path: '/', order: prev.length, visible: true }]);
  };
  const update = (index: number, patch: Partial<NavItem>) => {
    setItems(prev => prev.map((it, i) => i === index ? { ...it, ...patch } : it));
  };
  const remove = (index: number) => { setItems(prev => prev.filter((_, i) => i !== index).map((it, i) => ({ ...it, order: i }))); };
  const move = (from: number, to: number) => {
    const arr = [...items];
    const [m] = arr.splice(from, 1);
    arr.splice(to, 0, m);
    setItems(arr.map((it, i) => ({ ...it, order: i })));
  };
  const save = async () => {
    try {
      setSaving(true);
      const payload = items.map((n, i) => ({ label: n.label.trim(), path: n.path.trim() || '/', order: i, visible: !!n.visible }));
      await apiFetch('/settings', { method: 'PUT', body: { navigation: payload } });
      toast.success('Navigation saved');
      await load();
    } catch (e: any) { toast.error(e?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-gray-900">Navigation</h1>
        <div className="flex gap-2">
          <Button onClick={add} className="rounded-xl"><Plus className="w-4 h-4 mr-2"/>Add Item</Button>
          <Button onClick={save} disabled={saving} className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-600">{saving? 'Saving…':'Save'}</Button>
        </div>
      </div>

      {loading ? (
        <div className="p-4 text-gray-500">Loading…</div>
      ) : (
        <div className="space-y-4">
          {items.map((it, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-4">
                <div className="grid md:grid-cols-12 gap-3 items-center">
                  <div className="md:col-span-3">
                    <label className="text-sm text-gray-600">Label</label>
                    <Input value={it.label} onChange={(e)=> update(idx, { label: e.target.value })} className="mt-1" />
                  </div>
                  <div className="md:col-span-5">
                    <label className="text-sm text-gray-600">Path</label>
                    <div className="relative mt-1">
                      <LinkIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input value={it.path} onChange={(e)=> update(idx, { path: e.target.value })} className="pl-9" />
                    </div>
                  </div>
                  <div className="md:col-span-2 flex items-center gap-2 mt-6 md:mt-0">
                    <Checkbox id={`vis-${idx}`} checked={!!it.visible} onCheckedChange={(v: boolean | 'indeterminate' | undefined)=> update(idx, { visible: !!v })} />
                    <label htmlFor={`vis-${idx}`} className="text-sm">Visible</label>
                  </div>
                  <div className="md:col-span-2 flex items-center justify-end gap-2">
                    <Button size="icon" variant="outline" disabled={idx===0} onClick={()=> move(idx, idx-1)}><ArrowUp className="w-4 h-4"/></Button>
                    <Button size="icon" variant="outline" disabled={idx===items.length-1} onClick={()=> move(idx, idx+1)}><ArrowDown className="w-4 h-4"/></Button>
                    <Button size="icon" variant="outline" onClick={()=> remove(idx)} className="text-red-600"><Trash2 className="w-4 h-4"/></Button>
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
