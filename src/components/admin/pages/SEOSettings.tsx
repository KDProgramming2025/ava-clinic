import { useEffect, useState } from 'react';
import { Card } from '../../ui/card';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Save, RefreshCcw, Search } from 'lucide-react';
import { apiFetch } from '../../../api/client';
import { toast } from 'sonner';

interface SettingsPayload { siteTitle?: string|null; metaDescription?: string|null; ogImage?: string|null }
interface SettingsResponse { settings?: SettingsPayload | null }

export function SEOSettings() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [dirty, setDirty] = useState(false);
  const [form, setForm] = useState<SettingsPayload>({ siteTitle: '', metaDescription: '', ogImage: '' });
  const [initial, setInitial] = useState<SettingsPayload>({ siteTitle: '', metaDescription: '', ogImage: '' });

  const load = async () => {
    try {
      setLoading(true); setError(null);
      const res = await apiFetch<SettingsResponse>('/settings');
      const s = res?.settings || {};
      const merged = {
        siteTitle: s.siteTitle ?? '',
        metaDescription: s.metaDescription ?? '',
        ogImage: s.ogImage ?? '',
      };
      setForm(merged); setInitial(merged); setDirty(false);
    } catch (e: any) { setError(e?.message || 'Failed to load settings'); }
    finally { setLoading(false); }
  };
  useEffect(()=>{ load(); }, []);

  const change = (patch: Partial<SettingsPayload>) => {
    setForm(f => { const next = { ...f, ...patch }; setDirty(JSON.stringify(next) !== JSON.stringify(initial)); return next; });
  };

  const reset = () => { setForm(initial); setDirty(false); };

  const save = async () => {
    try {
      if (!form.siteTitle?.trim()) { toast.error('Site title is required'); return; }
      const payload = { settings: {
        siteTitle: form.siteTitle?.trim(),
        metaDescription: form.metaDescription?.trim() || '',
        ogImage: form.ogImage?.trim() || '',
      }};
      await apiFetch('/settings', { method: 'PUT', body: payload });
      toast.success('SEO settings saved');
      await load();
    } catch (e: any) { toast.error(e?.message || 'Save failed'); }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-gray-900">SEO Settings</h1>
          <p className="text-gray-600">Control global SEO meta fields used across the site.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" disabled={!dirty} onClick={reset} className="rounded-xl"><RefreshCcw className="w-4 h-4 mr-2" />Reset</Button>
          <Button disabled={!dirty} onClick={save} className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl"><Save className="w-4 h-4 mr-2" />Save Changes</Button>
        </div>
      </div>

      {loading && <div className="p-4 text-gray-500">Loading…</div>}
      {error && <div className="p-4 text-red-600">{error}</div>}

      {!loading && !error && (
        <Card className="p-6 border-0 shadow-lg space-y-6">
          <div className="flex items-center gap-2 text-gray-900"><Search className="w-5 h-5 text-purple-600" />Global SEO</div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Label htmlFor="seo-title">Site Title*</Label>
              <Input id="seo-title" value={form.siteTitle ?? ''} onChange={(e)=> change({ siteTitle: e.target.value })} className="mt-2 rounded-xl" placeholder="Ava Beauty Clinic" />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="seo-desc">Meta Description</Label>
              <Textarea id="seo-desc" value={form.metaDescription ?? ''} onChange={(e)=> change({ metaDescription: e.target.value })} className="mt-2 rounded-xl" rows={4} placeholder="Women’s hair & eyebrow implant clinic..." />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="seo-og">OpenGraph Image URL</Label>
              <Input id="seo-og" value={form.ogImage ?? ''} onChange={(e)=> change({ ogImage: e.target.value })} className="mt-2 rounded-xl" placeholder="https://.../og.jpg" />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
