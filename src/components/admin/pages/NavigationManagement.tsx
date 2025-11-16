import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Save, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, Link as LinkIcon } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Checkbox } from '../../ui/checkbox';
import { toast } from 'sonner';
import { apiFetch } from '../../../api/client';
import { useLanguage } from '../../LanguageContext';

interface NavItem {
  id?: string;
  label?: string;
  labelEn?: string;
  labelFa?: string;
  path: string;
  order: number;
  visible: boolean;
}

export default function NavigationManagement() {
  const { t } = useLanguage();
  const [items, setItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<any>('/settings');
      const nav = Array.isArray(data?.navigation) ? data.navigation : [];
      // Ensure order and bilingual fallbacks
      const normalized = nav.map((n: any, i: number) => ({
        id: n.id,
        label: n.label || '',
        labelEn: n.labelEn || n.label || '',
        labelFa: n.labelFa || n.label || '',
        path: n.path || '/',
        order: n.order ?? i,
        visible: n.visible ?? true,
      }))
        .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
      setItems(normalized);
    } catch (e: any) {
      toast.error(e?.message || t('admin.navigationManagement.loadFailed'));
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const add = () => {
    const defaultLabel = t('admin.navigationManagement.label');
    setItems(prev => [...prev, {
      label: defaultLabel,
      labelEn: defaultLabel,
      labelFa: defaultLabel,
      path: '/',
      order: prev.length,
      visible: true,
    }]);
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
      const payload = items.map((n, i) => {
        const labelEn = (n.labelEn || '').trim();
        const labelFa = (n.labelFa || '').trim();
        const fallback = (n.label || '').trim();
        return {
          label: labelFa || labelEn || fallback || t('admin.navigationManagement.label'),
          labelEn: labelEn || null,
          labelFa: labelFa || null,
          path: (n.path || '').trim() || '/',
          order: i,
          visible: !!n.visible,
        };
      });
      await apiFetch('/settings', { method: 'PUT', body: { navigation: payload } });
  toast.success(t('admin.navigationManagement.saved'));
      await load();
  } catch (e: any) { toast.error(e?.message || t('admin.navigationManagement.saveFailed')); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
  <h1 className="text-gray-900">{t('admin.navigationManagement.title')}</h1>
        <div className="flex gap-2">
          <Button onClick={add} className="rounded-xl"><Plus className="w-4 h-4 mr-2"/>{t('admin.navigationManagement.addItem')}</Button>
          <Button onClick={save} disabled={saving} className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-600">{saving? t('admin.navigationManagement.saving'): t('admin.navigationManagement.save')}</Button>
        </div>
      </div>

      {loading ? (
  <div className="p-4 text-gray-500">{t('common.loading')}</div>
      ) : (
        <div className="space-y-4">
          {items.map((it, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-4">
                <div className="grid md:grid-cols-12 gap-3 items-center">
                  <div className="md:col-span-4">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm text-gray-600">{t('admin.navigationManagement.label')} (EN)</label>
                        <Input value={it.labelEn || ''} onChange={(e)=> update(idx, { labelEn: e.target.value })} className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">{t('admin.navigationManagement.label')} (FA)</label>
                        <Input dir="rtl" value={it.labelFa || ''} onChange={(e)=> update(idx, { labelFa: e.target.value })} className="mt-1 text-right" />
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-5">
                    <label className="text-sm text-gray-600">{t('admin.navigationManagement.path')}</label>
                    <div className="relative mt-1">
                      <LinkIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input value={it.path} onChange={(e)=> update(idx, { path: e.target.value })} className="pl-9" />
                    </div>
                  </div>
                  <div className="md:col-span-2 flex items-center gap-2 mt-6 md:mt-0">
                    <Checkbox id={`vis-${idx}`} checked={!!it.visible} onCheckedChange={(v: boolean | 'indeterminate' | undefined)=> update(idx, { visible: !!v })} />
                    <label htmlFor={`vis-${idx}`} className="text-sm">{t('admin.navigationManagement.visible')}</label>
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
