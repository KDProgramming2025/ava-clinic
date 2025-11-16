import { useEffect, useState } from 'react';
import { Card } from '../../ui/card';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Save, RefreshCcw, Globe } from 'lucide-react';
import { apiFetch } from '../../../api/client';
import { toast } from 'sonner';
import { useLanguage } from '../../LanguageContext';

interface SettingsPayload {
  siteTitle?: string|null;
  metaDescription?: string|null;
  ogImage?: string|null;
  siteTitleEn?: string|null;
  siteTitleFa?: string|null;
  metaDescriptionEn?: string|null;
  metaDescriptionFa?: string|null;
}
interface SettingsResponse { settings?: SettingsPayload | null }

export function SEOSettings() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [dirty, setDirty] = useState(false);
  const [form, setForm] = useState<SettingsPayload>({ siteTitle: '', metaDescription: '', ogImage: '', siteTitleEn: '', siteTitleFa: '', metaDescriptionEn: '', metaDescriptionFa: '' });
  const [initial, setInitial] = useState<SettingsPayload>({ siteTitle: '', metaDescription: '', ogImage: '', siteTitleEn: '', siteTitleFa: '', metaDescriptionEn: '', metaDescriptionFa: '' });

  const load = async () => {
    try {
      setLoading(true); setError(null);
      const res = await apiFetch<SettingsResponse>('/settings');
      const s = res?.settings || {};
      const merged: SettingsPayload = {
        siteTitle: s.siteTitle ?? '',
        metaDescription: s.metaDescription ?? '',
        ogImage: s.ogImage ?? '',
        siteTitleEn: s.siteTitleEn ?? s.siteTitle ?? '',
        siteTitleFa: s.siteTitleFa ?? s.siteTitle ?? '',
        metaDescriptionEn: s.metaDescriptionEn ?? s.metaDescription ?? '',
        metaDescriptionFa: s.metaDescriptionFa ?? s.metaDescription ?? '',
      };
      setForm(merged); setInitial(merged); setDirty(false);
    } catch (e: any) {
      setError(e?.message || t('admin.seo.loadFailed'));
    } finally {
      setLoading(false);
    }
  };
  useEffect(()=>{ load(); }, []);

  const change = (patch: Partial<SettingsPayload>) => {
    setForm(f => { const next = { ...f, ...patch }; setDirty(JSON.stringify(next) !== JSON.stringify(initial)); return next; });
  };

  const reset = () => { setForm(initial); setDirty(false); };

  const save = async () => {
    try {
      const siteTitleEn = form.siteTitleEn?.trim();
      const siteTitleFa = form.siteTitleFa?.trim();
      if (!siteTitleEn && !siteTitleFa) { toast.error(t('admin.seo.siteTitleRequired')); return; }
      const payload = { settings: {
        siteTitle: form.siteTitle?.trim() || siteTitleFa || siteTitleEn || '',
        metaDescription: form.metaDescription?.trim() || form.metaDescriptionFa?.trim() || form.metaDescriptionEn?.trim() || '',
        ogImage: form.ogImage?.trim() || '',
        siteTitleEn,
        siteTitleFa,
        metaDescriptionEn: form.metaDescriptionEn?.trim() || '',
        metaDescriptionFa: form.metaDescriptionFa?.trim() || '',
      }};
      await apiFetch('/settings', { method: 'PUT', body: payload });
      toast.success(t('admin.seo.saved'));
      await load();
    } catch (e: any) {
      toast.error(e?.message || t('admin.seo.saveFailed'));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-gray-900">{t('admin.seoSettings.title')}</h1>
          <p className="text-gray-600">{t('admin.seoSettings.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" disabled={!dirty} onClick={reset} className="rounded-xl"><RefreshCcw className="w-4 h-4 mr-2" />{t('admin.cancel')}</Button>
          <Button disabled={!dirty} onClick={save} className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl"><Save className="w-4 h-4 mr-2" />{t('admin.saveChanges')}</Button>
        </div>
      </div>

      {loading && <div className="p-4 text-gray-500">{t('common.loading')}</div>}
      {error && <div className="p-4 text-red-600">{error}</div>}

      {!loading && !error && (
        <Card className="p-6 border-0 shadow-lg space-y-6">
          <div className="flex items-center gap-2 text-gray-900"><Globe className="w-5 h-5 text-indigo-600" />{t('admin.seo.globalSection')}</div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="seo-title-en">{t('admin.seo.siteTitleLabel')} (EN)</Label>
              <Input id="seo-title-en" value={form.siteTitleEn ?? ''} onChange={(e)=> change({ siteTitleEn: e.target.value })} className="mt-2 rounded-xl" placeholder={t('admin.seo.siteTitlePlaceholder')} />
            </div>
            <div>
              <Label htmlFor="seo-title-fa">{t('admin.seo.siteTitleLabel')} (FA)</Label>
              <Input id="seo-title-fa" value={form.siteTitleFa ?? ''} onChange={(e)=> change({ siteTitleFa: e.target.value })} className="mt-2 rounded-xl text-right" dir="rtl" placeholder={t('admin.seo.siteTitlePlaceholder')} />
            </div>
            <div>
              <Label htmlFor="seo-desc-en">{t('admin.seo.metaDescriptionLabel')} (EN)</Label>
              <Textarea id="seo-desc-en" value={form.metaDescriptionEn ?? ''} onChange={(e)=> change({ metaDescriptionEn: e.target.value })} className="mt-2 rounded-xl" rows={4} placeholder={t('admin.seo.metaDescriptionPlaceholder')} />
            </div>
            <div>
              <Label htmlFor="seo-desc-fa">{t('admin.seo.metaDescriptionLabel')} (FA)</Label>
              <Textarea id="seo-desc-fa" value={form.metaDescriptionFa ?? ''} onChange={(e)=> change({ metaDescriptionFa: e.target.value })} className="mt-2 rounded-xl text-right" rows={4} dir="rtl" placeholder={t('admin.seo.metaDescriptionPlaceholder')} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="seo-og">{t('admin.seo.ogImageLabel')}</Label>
              <Input id="seo-og" value={form.ogImage ?? ''} onChange={(e)=> change({ ogImage: e.target.value })} className="mt-2 rounded-xl" placeholder={t('admin.seo.ogImagePlaceholder')} />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
