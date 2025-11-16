import { useEffect, useState } from 'react';
import { Card } from '../../ui/card';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Save, RefreshCcw, Mail } from 'lucide-react';
import { apiFetch } from '../../../api/client';
import { useLanguage } from '../../LanguageContext';
import { toast } from 'sonner';

interface Newsletter { headline?: string; description?: string; buttonLabel?: string }

export function NewsletterSettings() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [dirty, setDirty] = useState(false);
  const [form, setForm] = useState<Newsletter>({ headline: '', description: '', buttonLabel: '' });
  const [initial, setInitial] = useState<Newsletter>({ headline: '', description: '', buttonLabel: '' });

  const load = async () => {
    try {
      setLoading(true); setError(null);
      const res = await apiFetch<Newsletter>('/newsletter');
      const merged = { headline: res?.headline || '', description: res?.description || '', buttonLabel: res?.buttonLabel || '' };
      setForm(merged); setInitial(merged); setDirty(false);
  } catch (e: any) { setError(e?.message || t('admin.newsletter.loadFailed')); }
    finally { setLoading(false); }
  };

  useEffect(()=>{ load(); }, []);

  const change = (patch: Partial<Newsletter>) => { setForm(f => { const next = { ...f, ...patch }; setDirty(JSON.stringify(next) !== JSON.stringify(initial)); return next; }); };

  const reset = () => { setForm(initial); setDirty(false); };

  const save = async () => {
    try {
  if (!form.headline?.trim()) { toast.error(t('admin.newsletter.headlineRequired')); return; }
      await apiFetch('/newsletter', { method: 'PUT', body: {
        headline: form.headline?.trim(),
        description: form.description?.trim() || '',
  buttonLabel: form.buttonLabel?.trim() || t('admin.newsletter.buttonPlaceholder'),
      }});
  toast.success(t('admin.newsletter.saved'));
      await load();
  } catch (e: any) { toast.error(e?.message || t('admin.newsletter.saveFailed')); }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-gray-900">{t('admin.newsletterSettings.title')}</h1>
          <p className="text-gray-600">{t('admin.newsletterSettings.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" disabled={!dirty} onClick={reset} className="rounded-xl"><RefreshCcw className="w-4 h-4 mr-2" />{t('admin.reset') || t('admin.cancel')}</Button>
          <Button disabled={!dirty} onClick={save} className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl"><Save className="w-4 h-4 mr-2" />{t('admin.saveChanges') || t('admin.save')}</Button>
        </div>
      </div>

  {loading && <div className="p-4 text-gray-500">{t('common.loading')}</div>}
  {error && <div className="p-4 text-red-600">{error}</div>}

      {!loading && !error && (
        <Card className="p-6 border-0 shadow-lg space-y-6">
          <div className="flex items-center gap-2 text-gray-900"><Mail className="w-5 h-5 text-pink-500" />{t('admin.newsletter.contentSection')}</div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Label htmlFor="nl-headline">{t('admin.newsletter.headlineLabel')}</Label>
              <Input id="nl-headline" value={form.headline} onChange={(e)=> change({ headline: e.target.value })} className="mt-2 rounded-xl" placeholder={t('admin.newsletter.headlinePlaceholder')} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="nl-description">{t('admin.newsletter.descriptionLabel')}</Label>
              <Textarea id="nl-description" value={form.description} onChange={(e)=> change({ description: e.target.value })} className="mt-2 rounded-xl" rows={4} placeholder={t('admin.newsletter.descriptionPlaceholder')} />
            </div>
            <div className="md:col-span-1">
              <Label htmlFor="nl-button">{t('admin.newsletter.buttonLabel')}</Label>
              <Input id="nl-button" value={form.buttonLabel} onChange={(e)=> change({ buttonLabel: e.target.value })} className="mt-2 rounded-xl" placeholder={t('admin.newsletter.buttonPlaceholder')} />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
