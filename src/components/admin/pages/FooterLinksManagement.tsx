import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Link as LinkIcon, Folder } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { toast } from 'sonner';
import { apiFetch } from '../../../api/client';
import { useLanguage } from '../../LanguageContext';

interface FooterLink {
  id?: string;
  label?: string;
  labelEn?: string;
  labelFa?: string;
  url: string;
  group?: string | null;
  groupEn?: string | null;
  groupFa?: string | null;
}

export default function FooterLinksManagement() {
  const { t } = useLanguage();
  const [items, setItems] = useState<FooterLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<any>('/settings');
      const links = Array.isArray(data?.footerLinks) ? data.footerLinks : [];
      setItems(links.map((l: any) => ({
        id: l.id,
        label: l.label || '',
        labelEn: l.labelEn || l.label || '',
        labelFa: l.labelFa || l.label || '',
        url: l.url || '/',
        group: l.group || '',
        groupEn: l.groupEn || l.group || '',
        groupFa: l.groupFa || l.group || '',
      })));
    } catch (e: any) {
  toast.error(e?.message || t('admin.footerLinksManagement.loadFailed'));
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const add = () => {
    const defaultLabel = t('admin.footerLinksManagement.label');
    setItems(prev => [...prev, {
      label: defaultLabel,
      labelEn: defaultLabel,
      labelFa: defaultLabel,
      url: '/',
      group: '',
      groupEn: '',
      groupFa: '',
    }]);
  };
  const update = (index: number, patch: Partial<FooterLink>) => setItems(prev => prev.map((it, i) => i === index ? { ...it, ...patch } : it));
  const remove = (index: number) => setItems(prev => prev.filter((_, i) => i !== index));

  const save = async () => {
    try {
      setSaving(true);
      const payload = items.map(l => {
        const labelEn = (l.labelEn || '').trim();
        const labelFa = (l.labelFa || '').trim();
        const groupEn = (l.groupEn || '').trim();
        const groupFa = (l.groupFa || '').trim();
        const fallbackLabel = (l.label || '').trim();
        const fallbackGroup = (l.group || '').trim();
        return {
          label: labelFa || labelEn || fallbackLabel || t('admin.footerLinksManagement.label'),
          labelEn: labelEn || null,
          labelFa: labelFa || null,
          url: (l.url || '').trim() || '/',
          group: groupFa || groupEn || fallbackGroup || null,
          groupEn: groupEn || null,
          groupFa: groupFa || null,
        };
      });
      await apiFetch('/settings', { method: 'PUT', body: { footerLinks: payload } });
  toast.success(t('admin.footerLinksManagement.saved'));
  await load();
    } catch (e: any) { toast.error(e?.message || t('admin.footerLinksManagement.saveFailed')); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
    <h1 className="text-gray-900">{t('admin.footerLinksManagement.title')}</h1>
        <div className="flex gap-2">
          <Button onClick={add} className="rounded-xl"><Plus className="w-4 h-4 mr-2"/>{t('admin.footerLinksManagement.addLink')}</Button>
          <Button onClick={save} disabled={saving} className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-600">{saving? t('admin.footerLinksManagement.saving'): t('admin.footerLinksManagement.save')}</Button>
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
                        <label className="text-sm text-gray-600">{t('admin.footerLinksManagement.label')} (EN)</label>
                        <Input value={it.labelEn || ''} onChange={(e)=> update(idx, { labelEn: e.target.value })} className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">{t('admin.footerLinksManagement.label')} (FA)</label>
                        <Input dir="rtl" value={it.labelFa || ''} onChange={(e)=> update(idx, { labelFa: e.target.value })} className="mt-1 text-right" />
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-5">
                    <label className="text-sm text-gray-600">{t('admin.footerLinksManagement.url')}</label>
                    <div className="relative mt-1">
                      <LinkIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input value={it.url} onChange={(e)=> update(idx, { url: e.target.value })} className="pl-9" />
                    </div>
                  </div>
                  <div className="md:col-span-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm text-gray-600">{t('admin.footerLinksManagement.group')} (EN)</label>
                        <div className="relative mt-1">
                          <Folder className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <Input value={it.groupEn || ''} onChange={(e)=> update(idx, { groupEn: e.target.value })} className="pl-9" />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">{t('admin.footerLinksManagement.group')} (FA)</label>
                        <div className="relative mt-1">
                          <Folder className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <Input dir="rtl" value={it.groupFa || ''} onChange={(e)=> update(idx, { groupFa: e.target.value })} className="pl-9 text-right" />
                        </div>
                      </div>
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
