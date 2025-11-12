import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Save, Trash2, Link as LinkIcon, Folder } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { toast } from 'sonner';
import { apiFetch } from '../../../api/client';

interface FooterLink { id?: string; label: string; url: string; group?: string | null; }

export default function FooterLinksManagement() {
  const [items, setItems] = useState<FooterLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<any>('/settings');
      const links = Array.isArray(data?.footerLinks) ? data.footerLinks : [];
      setItems(links.map((l: any) => ({ id: l.id, label: l.label || '', url: l.url || '', group: l.group || '' })));
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load footer links');
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const add = () => setItems(prev => [...prev, { label: 'New Link', url: '/', group: '' }]);
  const update = (index: number, patch: Partial<FooterLink>) => setItems(prev => prev.map((it, i) => i === index ? { ...it, ...patch } : it));
  const remove = (index: number) => setItems(prev => prev.filter((_, i) => i !== index));

  const save = async () => {
    try {
      setSaving(true);
      const payload = items.map(l => ({ label: l.label.trim(), url: l.url.trim() || '/', group: l.group?.trim() || null }));
      await apiFetch('/settings', { method: 'PUT', body: { footerLinks: payload } });
      toast.success('Footer links saved');
      await load();
    } catch (e: any) { toast.error(e?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-gray-900">Footer Links</h1>
        <div className="flex gap-2">
          <Button onClick={add} className="rounded-xl"><Plus className="w-4 h-4 mr-2"/>Add Link</Button>
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
                  <div className="md:col-span-4">
                    <label className="text-sm text-gray-600">Label</label>
                    <Input value={it.label} onChange={(e)=> update(idx, { label: e.target.value })} className="mt-1" />
                  </div>
                  <div className="md:col-span-5">
                    <label className="text-sm text-gray-600">URL</label>
                    <div className="relative mt-1">
                      <LinkIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input value={it.url} onChange={(e)=> update(idx, { url: e.target.value })} className="pl-9" />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-600">Group</label>
                    <div className="relative mt-1">
                      <Folder className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input value={it.group || ''} onChange={(e)=> update(idx, { group: e.target.value })} className="pl-9" />
                    </div>
                  </div>
                  <div className="md:col-span-1 flex items-center justify-end">
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
