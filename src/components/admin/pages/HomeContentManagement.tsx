import { ChangeEvent, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Edit, Plus, Trash2, Save, RefreshCcw, LayoutGrid, Activity, Sparkles, UploadCloud, Image as ImageIcon, Palette } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Badge } from '../../ui/badge';
import { toast } from 'sonner';
import { apiFetch } from '../../../api/client';
import { useLanguage } from '../../LanguageContext';
import { resolveMediaUrl } from '../../../utils/media';
import { IconPicker } from '../IconPicker';

interface HomeHero {
  title?: string|null;
  titleEn?: string|null;
  titleFa?: string|null;
  subtitle?: string|null;
  subtitleEn?: string|null;
  subtitleFa?: string|null;
  description?: string|null;
  descriptionEn?: string|null;
  descriptionFa?: string|null;
  ctaPrimaryLabel?: string|null;
  ctaPrimaryLabelEn?: string|null;
  ctaPrimaryLabelFa?: string|null;
  ctaSecondaryLabel?: string|null;
  ctaSecondaryLabelEn?: string|null;
  ctaSecondaryLabelFa?: string|null;
  imageUrl?: string|null;
}
interface HomeStat { id: string; label: string; labelEn?: string|null; labelFa?: string|null; value: number; icon?: string|null; }
interface HomeFeature { id: string; title: string; titleEn?: string|null; titleFa?: string|null; description?: string|null; descriptionEn?: string|null; descriptionFa?: string|null; icon?: string|null; }
interface HomeCTA {
  heading?: string|null;
  headingEn?: string|null;
  headingFa?: string|null;
  subheading?: string|null;
  subheadingEn?: string|null;
  subheadingFa?: string|null;
  buttonLabel?: string|null;
  buttonLabelEn?: string|null;
  buttonLabelFa?: string|null;
}
interface HomeData { hero?: HomeHero|null; stats: HomeStat[]; features: HomeFeature[]; cta?: HomeCTA|null; }

export function HomeContentManagement() {
  const { t } = useLanguage();
  const [data, setData] = useState<HomeData>({ hero: null, stats: [], features: [], cta: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [dirty, setDirty] = useState(false);

  // Local editable copies
  const [hero, setHero] = useState<HomeHero>({ titleEn: '', titleFa: '', subtitleEn: '', subtitleFa: '', descriptionEn: '', descriptionFa: '', ctaPrimaryLabelEn: '', ctaPrimaryLabelFa: '', ctaSecondaryLabelEn: '', ctaSecondaryLabelFa: '', imageUrl: '' });
  const [stats, setStats] = useState<HomeStat[]>([]);
  const [features, setFeatures] = useState<HomeFeature[]>([]);
  const [cta, setCta] = useState<HomeCTA>({ heading: '', subheading: '', buttonLabel: '' });

  const [statDialogOpen, setStatDialogOpen] = useState(false);
  const [featureDialogOpen, setFeatureDialogOpen] = useState(false);
  const [editingStat, setEditingStat] = useState<HomeStat|null>(null);
  const [editingFeature, setEditingFeature] = useState<HomeFeature|null>(null);
  const [statForm, setStatForm] = useState<{ labelEn: string; labelFa: string; value: string; icon: string }>({ labelEn: '', labelFa: '', value: '', icon: '' });
  const [featureForm, setFeatureForm] = useState<{ titleEn: string; titleFa: string; descriptionEn: string; descriptionFa: string; icon: string }>({ titleEn: '', titleFa: '', descriptionEn: '', descriptionFa: '', icon: '' });
  const [heroImageProcessing, setHeroImageProcessing] = useState(false);
  const [statIconProcessing, setStatIconProcessing] = useState(false);
  const [featureIconProcessing, setFeatureIconProcessing] = useState(false);
  const [statIconPickerOpen, setStatIconPickerOpen] = useState(false);
  const [featureIconPickerOpen, setFeatureIconPickerOpen] = useState(false);

  const renderIcon = (icon?: string | null, className = 'w-5 h-5') => {
    if (!icon) return null;
    const trimmed = icon.trim();
    if (trimmed.startsWith('lucide:')) {
      const name = trimmed.replace('lucide:', '');
      const IconComponent = (LucideIcons as any)[name];
      if (IconComponent) return <IconComponent className={className} />;
      return <span className="text-xs text-gray-500">{name}</span>;
    }
    return <img src={resolveMediaUrl(trimmed)} alt="icon" className={`${className} object-cover rounded`} />;
  };

  const randomId = () => {
    const g = globalThis as typeof globalThis & { crypto?: Crypto };
    if (g.crypto?.randomUUID) return g.crypto.randomUUID();
    if (g.crypto?.getRandomValues) {
      const bytes = g.crypto.getRandomValues(new Uint32Array(4));
      return Array.from(bytes, (value) => value.toString(16).padStart(8, '0')).join('-');
    }
    return `tmp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  };

  const pickInput = (...values: Array<string | null | undefined>) => {
    for (const value of values) {
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed.length) return trimmed;
      }
    }
    return '';
  };
  const hydrateHero = (source?: HomeHero | null): HomeHero => ({
    title: source?.title ?? null,
    titleEn: pickInput(source?.titleEn, source?.title),
    titleFa: pickInput(source?.titleFa, source?.title),
    subtitle: source?.subtitle ?? null,
    subtitleEn: pickInput(source?.subtitleEn, source?.subtitle),
    subtitleFa: pickInput(source?.subtitleFa, source?.subtitle),
    description: source?.description ?? null,
    descriptionEn: pickInput(source?.descriptionEn, source?.description),
    descriptionFa: pickInput(source?.descriptionFa, source?.description),
    ctaPrimaryLabel: source?.ctaPrimaryLabel ?? null,
    ctaPrimaryLabelEn: pickInput(source?.ctaPrimaryLabelEn, source?.ctaPrimaryLabel),
    ctaPrimaryLabelFa: pickInput(source?.ctaPrimaryLabelFa, source?.ctaPrimaryLabel),
    ctaSecondaryLabel: source?.ctaSecondaryLabel ?? null,
    ctaSecondaryLabelEn: pickInput(source?.ctaSecondaryLabelEn, source?.ctaSecondaryLabel),
    ctaSecondaryLabelFa: pickInput(source?.ctaSecondaryLabelFa, source?.ctaSecondaryLabel),
    imageUrl: pickInput(source?.imageUrl),
  });
  const hydrateStats = (list?: HomeStat[] | null): HomeStat[] =>
    (list || []).map((s) => ({
      id: s.id,
      label: pickInput(s.label, s.labelFa, s.labelEn) || 'Stat',
      labelEn: pickInput(s.labelEn, s.label),
      labelFa: pickInput(s.labelFa, s.label),
      value: Number.isFinite(Number(s.value)) ? Number(s.value) : 0,
      icon: pickInput(s.icon) || null,
    }));
  const hydrateFeatures = (list?: HomeFeature[] | null): HomeFeature[] =>
    (list || []).map((f) => ({
      id: f.id,
      title: pickInput(f.title, f.titleFa, f.titleEn) || 'Feature',
      titleEn: pickInput(f.titleEn, f.title),
      titleFa: pickInput(f.titleFa, f.title),
      description: pickInput(f.description, f.descriptionFa, f.descriptionEn),
      descriptionEn: pickInput(f.descriptionEn, f.description),
      descriptionFa: pickInput(f.descriptionFa, f.description),
      icon: pickInput(f.icon) || null,
    }));
  const hydrateCta = (source?: HomeCTA | null): HomeCTA => ({
    heading: source?.heading ?? null,
    headingEn: pickInput(source?.headingEn, source?.heading),
    headingFa: pickInput(source?.headingFa, source?.heading),
    subheading: source?.subheading ?? null,
    subheadingEn: pickInput(source?.subheadingEn, source?.subheading),
    subheadingFa: pickInput(source?.subheadingFa, source?.subheading),
    buttonLabel: source?.buttonLabel ?? null,
    buttonLabelEn: pickInput(source?.buttonLabelEn, source?.buttonLabel),
    buttonLabelFa: pickInput(source?.buttonLabelFa, source?.buttonLabel),
  });

  const persistHeroImage = async (nextUrl: string | null) => {
    try {
      const result = await apiFetch<{ imageUrl: string | null }>('/home/hero/image', { method: 'PUT', body: { imageUrl: nextUrl } });
      setHero((prev) => ({ ...prev, imageUrl: result?.imageUrl || null }));
      toast.success(nextUrl ? t('admin.homeContent.heroImageUpdated') : t('admin.homeContent.heroImageRemoved'));
      return result?.imageUrl || null;
    } catch (e: any) {
      toast.error(e?.message || t('admin.homeContent.heroImageUpdateFailed'));
      throw e;
    }
  };

  const uploadHeroImage = async (file: File) => {
    const previousUrl = hero.imageUrl || null;
    try {
      setHeroImageProcessing(true);
      const formData = new FormData();
      formData.append('file', file);
      const alt = hero.titleFa || hero.titleEn || hero.title;
      if (alt) formData.append('alt', alt);
      const created = await apiFetch<{ url: string; publicUrl?: string | null }>('/media/upload', { method: 'POST', body: formData });
      if (created?.url) {
        await persistHeroImage(created.url);
      }
    } catch (e: any) {
      setHero((prev) => ({ ...prev, imageUrl: previousUrl }));
      toast.error(e?.message || t('admin.media.uploadFailed'));
    } finally {
      setHeroImageProcessing(false);
    }
  };

  const handleHeroImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadHeroImage(file);
    event.target.value = '';
  };

  const removeHeroImage = async () => {
    if (!hero.imageUrl) return;
    try {
      setHeroImageProcessing(true);
      await persistHeroImage(null);
    } finally {
      setHeroImageProcessing(false);
    }
  };

  const uploadIcon = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiFetch<{ url: string; publicUrl?: string | null }>('/media/upload', { method: 'POST', body: formData });
  };

  const handleStatIconUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const prev = statForm.icon;
    try {
      setStatIconProcessing(true);
      const created = await uploadIcon(file);
      if (created?.url) {
        setStatForm(f => ({ ...f, icon: created.url }));
        setDirty(true);
      }
    } catch (e: any) {
      setStatForm(f => ({ ...f, icon: prev }));
      toast.error(e?.message || t('admin.media.uploadFailed'));
    } finally {
      setStatIconProcessing(false);
      event.target.value = '';
    }
  };

  const handleFeatureIconUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const prev = featureForm.icon;
    try {
      setFeatureIconProcessing(true);
      const created = await uploadIcon(file);
      if (created?.url) {
        setFeatureForm(f => ({ ...f, icon: created.url }));
        setDirty(true);
      }
    } catch (e: any) {
      setFeatureForm(f => ({ ...f, icon: prev }));
      toast.error(e?.message || t('admin.media.uploadFailed'));
    } finally {
      setFeatureIconProcessing(false);
      event.target.value = '';
    }
  };

  const fetchHome = async () => {
    try {
      setLoading(true); setError(null);
      const res = await apiFetch<HomeData>('/home');
      setData(res);
      setHero(hydrateHero(res.hero));
      setStats(hydrateStats(res.stats));
      setFeatures(hydrateFeatures(res.features));
      setCta(hydrateCta(res.cta));
      setDirty(false);
    } catch (e: any) {
  setError(e?.message || t('admin.homeContent.loadFailed'));
    } finally { setLoading(false); }
  };
  useEffect(()=>{ fetchHome(); }, []);

  const openNewStat = () => { setEditingStat(null); setStatForm({ labelEn: '', labelFa: '', value: '', icon: '' }); setStatDialogOpen(true); };
  const openEditStat = (s: HomeStat) => {
    setEditingStat(s);
    setStatForm({
      labelEn: s.labelEn || s.label || '',
      labelFa: s.labelFa || s.label || '',
      value: String(s.value ?? ''),
      icon: s.icon || '',
    });
    setStatDialogOpen(true);
  };
  const saveStat = () => {
    if ((!statForm.labelEn.trim() && !statForm.labelFa.trim()) || !statForm.value.trim()) { toast.error(t('admin.homeContent.statRequired')); return; }
    const valueNum = parseInt(statForm.value, 10); if (isNaN(valueNum)) { toast.error(t('admin.homeContent.statValueNumber')); return; }
    const canonical = statForm.labelFa.trim() || statForm.labelEn.trim();
    const next = {
      label: canonical || 'Stat',
      labelEn: statForm.labelEn.trim() || null,
      labelFa: statForm.labelFa.trim() || null,
      value: valueNum,
      icon: statForm.icon.trim() || null,
    };
    if (editingStat) {
      setStats(prev => prev.map(x => x.id === editingStat.id ? { ...editingStat, ...next } : x));
    } else {
      setStats(prev => [...prev, { id: randomId(), ...next }]);
    }
    setStatDialogOpen(false); setEditingStat(null); setDirty(true);
  };
  const deleteStat = (s: HomeStat) => { if (!confirm(t('admin.homeContent.deleteStatConfirm'))) return; setStats(prev => prev.filter(x => x.id !== s.id)); setDirty(true); };

  const openNewFeature = () => { setEditingFeature(null); setFeatureForm({ titleEn: '', titleFa: '', descriptionEn: '', descriptionFa: '', icon: '' }); setFeatureDialogOpen(true); };
  const openEditFeature = (f: HomeFeature) => {
    setEditingFeature(f);
    setFeatureForm({
      titleEn: f.titleEn || f.title || '',
      titleFa: f.titleFa || f.title || '',
      descriptionEn: f.descriptionEn || f.description || '',
      descriptionFa: f.descriptionFa || f.description || '',
      icon: f.icon || '',
    });
    setFeatureDialogOpen(true);
  };
  const saveFeature = () => {
    if (!featureForm.titleEn.trim() && !featureForm.titleFa.trim()) { toast.error(t('admin.homeContent.featureTitleRequired')); return; }
    const canonical = featureForm.titleFa.trim() || featureForm.titleEn.trim();
    const next = {
      title: canonical || 'Feature',
      titleEn: featureForm.titleEn.trim() || null,
      titleFa: featureForm.titleFa.trim() || null,
      description: featureForm.descriptionFa.trim() || featureForm.descriptionEn.trim() || null,
      descriptionEn: featureForm.descriptionEn.trim() || null,
      descriptionFa: featureForm.descriptionFa.trim() || null,
      icon: featureForm.icon.trim() || null,
    };
    if (editingFeature) {
      setFeatures(prev => prev.map(x => x.id === editingFeature.id ? { ...editingFeature, ...next } : x));
    } else {
      setFeatures(prev => [...prev, { id: randomId(), ...next }]);
    }
    setFeatureDialogOpen(false); setEditingFeature(null); setDirty(true);
  };
  const deleteFeature = (f: HomeFeature) => { if (!confirm(t('admin.homeContent.deleteFeatureConfirm'))) return; setFeatures(prev => prev.filter(x => x.id !== f.id)); setDirty(true); };

  const saveAll = async () => {
    try {
      const trimOrNull = (value?: string | null) => {
        if (typeof value !== 'string') return null;
        const trimmed = value.trim();
        return trimmed.length ? trimmed : null;
      };
      const canonicalFrom = (fa?: string | null, en?: string | null, fallback?: string | null) => trimOrNull(fa) || trimOrNull(en) || trimOrNull(fallback);
      const payload = {
        hero: {
          title: canonicalFrom(hero.titleFa, hero.titleEn, hero.title),
          titleEn: trimOrNull(hero.titleEn),
          titleFa: trimOrNull(hero.titleFa),
          subtitle: canonicalFrom(hero.subtitleFa, hero.subtitleEn, hero.subtitle),
          subtitleEn: trimOrNull(hero.subtitleEn),
          subtitleFa: trimOrNull(hero.subtitleFa),
          description: canonicalFrom(hero.descriptionFa, hero.descriptionEn, hero.description),
          descriptionEn: trimOrNull(hero.descriptionEn),
          descriptionFa: trimOrNull(hero.descriptionFa),
          ctaPrimaryLabel: canonicalFrom(hero.ctaPrimaryLabelFa, hero.ctaPrimaryLabelEn, hero.ctaPrimaryLabel),
          ctaPrimaryLabelEn: trimOrNull(hero.ctaPrimaryLabelEn),
          ctaPrimaryLabelFa: trimOrNull(hero.ctaPrimaryLabelFa),
          ctaSecondaryLabel: canonicalFrom(hero.ctaSecondaryLabelFa, hero.ctaSecondaryLabelEn, hero.ctaSecondaryLabel),
          ctaSecondaryLabelEn: trimOrNull(hero.ctaSecondaryLabelEn),
          ctaSecondaryLabelFa: trimOrNull(hero.ctaSecondaryLabelFa),
          imageUrl: trimOrNull(hero.imageUrl),
        },
        stats: stats.map(s => ({
          id: s.id,
          label: canonicalFrom(s.labelFa, s.labelEn, s.label),
          labelEn: trimOrNull(s.labelEn),
          labelFa: trimOrNull(s.labelFa),
          value: s.value,
          icon: trimOrNull(s.icon),
        })),
        features: features.map(f => ({
          id: f.id,
          title: canonicalFrom(f.titleFa, f.titleEn, f.title),
          titleEn: trimOrNull(f.titleEn),
          titleFa: trimOrNull(f.titleFa),
          description: canonicalFrom(f.descriptionFa, f.descriptionEn, f.description),
          descriptionEn: trimOrNull(f.descriptionEn),
          descriptionFa: trimOrNull(f.descriptionFa),
          icon: trimOrNull(f.icon),
        })),
        cta: {
          heading: canonicalFrom(cta.headingFa, cta.headingEn, cta.heading),
          headingEn: trimOrNull(cta.headingEn),
          headingFa: trimOrNull(cta.headingFa),
          subheading: canonicalFrom(cta.subheadingFa, cta.subheadingEn, cta.subheading),
          subheadingEn: trimOrNull(cta.subheadingEn),
          subheadingFa: trimOrNull(cta.subheadingFa),
          buttonLabel: canonicalFrom(cta.buttonLabelFa, cta.buttonLabelEn, cta.buttonLabel),
          buttonLabelEn: trimOrNull(cta.buttonLabelEn),
          buttonLabelFa: trimOrNull(cta.buttonLabelFa),
        }
      };
      await apiFetch('/home', { method: 'PUT', body: payload });
  toast.success(t('admin.homeContent.saved'));
      setDirty(false);
      await fetchHome();
  } catch (e: any) { toast.error(e?.message || t('admin.homeContent.saveFailed')); }
  };

  const resetChanges = () => {
    setHero(hydrateHero(data.hero));
    setStats(hydrateStats(data.stats));
    setFeatures(hydrateFeatures(data.features));
    setCta(hydrateCta(data.cta));
    setDirty(false);
  };

  const heroImagePreviewUrl = resolveMediaUrl(hero.imageUrl);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-gray-900">{t('admin.homeContent.title')}</h1>
          <p className="text-gray-600">{t('admin.homeContent.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" disabled={!dirty} onClick={resetChanges} className="rounded-xl"><RefreshCcw className="w-4 h-4 mr-2" />{t('admin.cancel')}</Button>
          <Button onClick={saveAll} disabled={!dirty} className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl"><Save className="w-4 h-4 mr-2" />{t('admin.saveChanges')}</Button>
        </div>
      </div>

  {loading && <div className="p-4 text-gray-500">{t('common.loading')}</div>}
      {error && <div className="p-4 text-red-600">{error}</div>}

      {!loading && !error && (
        <>
          {/* Hero Section */}
          <Card className="p-6 border-0 shadow-lg space-y-4">
            <div className="flex items-center justify-between"><h2 className="text-gray-900 flex items-center gap-2"><Sparkles className="w-5 h-5 text-pink-500" />{t('admin.homeContent.heroSection')}</h2></div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label>{t('admin.homeContent.heroTitleLabel')} (EN)</Label>
                  <Input value={hero.titleEn || ''} onChange={(e)=> { setHero(h=>({...h,titleEn:e.target.value})); setDirty(true);} } className="mt-2 rounded-xl" />
                </div>
                <div>
                  <Label>{t('admin.homeContent.heroTitleLabel')} (FA)</Label>
                  <Input dir="rtl" value={hero.titleFa || ''} onChange={(e)=> { setHero(h=>({...h,titleFa:e.target.value})); setDirty(true);} } className="mt-2 rounded-xl text-right" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label>{t('admin.homeContent.heroSubtitleLabel')} (EN)</Label>
                  <Input value={hero.subtitleEn || ''} onChange={(e)=> { setHero(h=>({...h,subtitleEn:e.target.value})); setDirty(true);} } className="mt-2 rounded-xl" />
                </div>
                <div>
                  <Label>{t('admin.homeContent.heroSubtitleLabel')} (FA)</Label>
                  <Input dir="rtl" value={hero.subtitleFa || ''} onChange={(e)=> { setHero(h=>({...h,subtitleFa:e.target.value})); setDirty(true);} } className="mt-2 rounded-xl text-right" />
                </div>
              </div>
              <div className="md:col-span-2 grid sm:grid-cols-2 gap-3">
                <div>
                  <Label>{t('admin.homeContent.heroDescriptionLabel')} (EN)</Label>
                  <Textarea value={hero.descriptionEn || ''} onChange={(e)=> { setHero(h=>({...h,descriptionEn:e.target.value})); setDirty(true);} } className="mt-2 rounded-xl" rows={3} />
                </div>
                <div>
                  <Label>{t('admin.homeContent.heroDescriptionLabel')} (FA)</Label>
                  <Textarea dir="rtl" value={hero.descriptionFa || ''} onChange={(e)=> { setHero(h=>({...h,descriptionFa:e.target.value})); setDirty(true);} } className="mt-2 rounded-xl text-right" rows={3} />
                </div>
              </div>
              <div className="md:col-span-2">
                <Label>{t('admin.homeContent.heroImageLabel')}</Label>
                <div className="mt-2 space-y-3">
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4">
                    {hero.imageUrl ? (
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="w-full sm:w-48 h-32 rounded-xl overflow-hidden border border-gray-200 bg-white shadow-inner">
                          <img src={heroImagePreviewUrl || hero.imageUrl || undefined} alt={hero.titleEn || hero.titleFa || 'hero image'} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 w-full">
                          <p className="text-sm text-gray-900 truncate" title={hero.imageUrl || undefined}>{hero.imageUrl}</p>
                          {heroImagePreviewUrl && (
                            <p className="text-xs text-gray-500 break-all mt-1">{heroImagePreviewUrl}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">{t('admin.homeContent.heroImageUploadHint')}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="text-red-600" onClick={removeHeroImage} disabled={heroImageProcessing}>
                          {t('admin.remove')}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center gap-3 py-6">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                        <p className="text-sm text-gray-600">{t('admin.homeContent.heroImageEmpty')}</p>
                      </div>
                    )}
                  </div>
                  <Input type="file" accept="image/*" onChange={handleHeroImageChange} disabled={heroImageProcessing} className="rounded-xl" />
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <UploadCloud className={`w-4 h-4 ${heroImageProcessing ? 'animate-spin' : ''}`} />
                    {heroImageProcessing ? t('admin.media.uploading') : t('admin.homeContent.heroImageUploadHint')}
                  </div>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label>{t('admin.homeContent.primaryCtaLabel')} (EN)</Label>
                  <Input value={hero.ctaPrimaryLabelEn || ''} onChange={(e)=> { setHero(h=>({...h,ctaPrimaryLabelEn:e.target.value})); setDirty(true);} } className="mt-2 rounded-xl" />
                </div>
                <div>
                  <Label>{t('admin.homeContent.primaryCtaLabel')} (FA)</Label>
                  <Input dir="rtl" value={hero.ctaPrimaryLabelFa || ''} onChange={(e)=> { setHero(h=>({...h,ctaPrimaryLabelFa:e.target.value})); setDirty(true);} } className="mt-2 rounded-xl text-right" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label>{t('admin.homeContent.secondaryCtaLabel')} (EN)</Label>
                  <Input value={hero.ctaSecondaryLabelEn || ''} onChange={(e)=> { setHero(h=>({...h,ctaSecondaryLabelEn:e.target.value})); setDirty(true);} } className="mt-2 rounded-xl" />
                </div>
                <div>
                  <Label>{t('admin.homeContent.secondaryCtaLabel')} (FA)</Label>
                  <Input dir="rtl" value={hero.ctaSecondaryLabelFa || ''} onChange={(e)=> { setHero(h=>({...h,ctaSecondaryLabelFa:e.target.value})); setDirty(true);} } className="mt-2 rounded-xl text-right" />
                </div>
              </div>
            </div>
          </Card>

          {/* Stats Section */}
          <Card className="p-6 border-0 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-gray-900 flex items-center gap-2"><Activity className="w-5 h-5 text-purple-500" />{t('admin.homeContent.statsSection')}</h2>
              <Button size="sm" onClick={openNewStat} className="rounded-xl"><Plus className="w-4 h-4 mr-2" />{t('admin.homeContent.addStat')}</Button>
            </div>
            {stats.length === 0 && <p className="text-gray-500">{t('admin.homeContent.noStats')}</p>}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.map(s => (
                <Card key={s.id} className="p-4 shadow-sm border border-gray-100 relative group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{s.label}</span>
                    <Badge className="bg-pink-100 text-pink-700">{s.value}</Badge>
                  </div>
                  {s.icon && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="text-gray-600">Icon:</span>
                      <div className="w-6 h-6 flex items-center justify-center rounded bg-gray-100 overflow-hidden">
                        {renderIcon(s.icon, 'w-5 h-5')}
                      </div>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="sm" onClick={()=> openEditStat(s)} className="rounded-md"><Edit className="w-4 h-4" /></Button>
                    <Button variant="outline" size="sm" onClick={()=> deleteStat(s)} className="rounded-md text-red-600"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          {/* Features Section */}
          <Card className="p-6 border-0 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-gray-900 flex items-center gap-2"><LayoutGrid className="w-5 h-5 text-indigo-500" />{t('admin.homeContent.featuresSection')}</h2>
              <Button size="sm" onClick={openNewFeature} className="rounded-xl"><Plus className="w-4 h-4 mr-2" />{t('admin.homeContent.addFeature')}</Button>
            </div>
            {features.length === 0 && <p className="text-gray-500">{t('admin.homeContent.noFeatures')}</p>}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map(f => (
                <Card key={f.id} className="p-4 shadow-sm border border-gray-100 relative group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900 line-clamp-1" title={f.title}>{f.title}</span>
                    <Badge className="bg-purple-100 text-purple-700 flex items-center gap-1 min-w-[48px] justify-center">
                      {f.icon ? renderIcon(f.icon, 'w-4 h-4') : '—'}
                    </Badge>
                  </div>
                  {f.description && <p className="text-sm text-gray-600 line-clamp-3">{f.description}</p>}
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="sm" onClick={()=> openEditFeature(f)} className="rounded-md"><Edit className="w-4 h-4" /></Button>
                    <Button variant="outline" size="sm" onClick={()=> deleteFeature(f)} className="rounded-md text-red-600"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          {/* CTA Section */}
          <Card className="p-6 border-0 shadow-lg space-y-4">
            <h2 className="text-gray-900 flex items-center gap-2"><Sparkles className="w-5 h-5 text-pink-500" />{t('admin.homeContent.ctaSection')}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label>{t('admin.homeContent.ctaHeadingLabel')} (EN)</Label>
                    <Input value={cta.headingEn || ''} onChange={(e)=> { setCta(c=>({...c,headingEn:e.target.value})); setDirty(true);} } className="mt-2 rounded-xl" />
                  </div>
                  <div>
                    <Label>{t('admin.homeContent.ctaHeadingLabel')} (FA)</Label>
                    <Input dir="rtl" value={cta.headingFa || ''} onChange={(e)=> { setCta(c=>({...c,headingFa:e.target.value})); setDirty(true);} } className="mt-2 rounded-xl text-right" />
                  </div>
                </div>
              </div>
              <div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label>{t('admin.homeContent.ctaSubheadingLabel')} (EN)</Label>
                    <Input value={cta.subheadingEn || ''} onChange={(e)=> { setCta(c=>({...c,subheadingEn:e.target.value})); setDirty(true);} } className="mt-2 rounded-xl" />
                  </div>
                  <div>
                    <Label>{t('admin.homeContent.ctaSubheadingLabel')} (FA)</Label>
                    <Input dir="rtl" value={cta.subheadingFa || ''} onChange={(e)=> { setCta(c=>({...c,subheadingFa:e.target.value})); setDirty(true);} } className="mt-2 rounded-xl text-right" />
                  </div>
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label>{t('admin.homeContent.ctaButtonLabel')} (EN)</Label>
                    <Input value={cta.buttonLabelEn || ''} onChange={(e)=> { setCta(c=>({...c,buttonLabelEn:e.target.value})); setDirty(true);} } className="mt-2 rounded-xl" />
                  </div>
                  <div>
                    <Label>{t('admin.homeContent.ctaButtonLabel')} (FA)</Label>
                    <Input dir="rtl" value={cta.buttonLabelFa || ''} onChange={(e)=> { setCta(c=>({...c,buttonLabelFa:e.target.value})); setDirty(true);} } className="mt-2 rounded-xl text-right" />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Stat Dialog */}
  <Dialog open={statDialogOpen} onOpenChange={(o: boolean)=> { if(!o){ setStatDialogOpen(false); setEditingStat(null);} }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingStat? t('admin.homeContent.stat.editTitle'): t('admin.homeContent.stat.addTitle')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="stat-label-en">{t('admin.homeContent.stat.labelLabel')} (EN)</Label>
                <Input id="stat-label-en" value={statForm.labelEn} onChange={(e)=> setStatForm(f=>({...f,labelEn:e.target.value}))} className="mt-2 rounded-xl" />
              </div>
              <div>
                <Label htmlFor="stat-label-fa">{t('admin.homeContent.stat.labelLabel')} (FA)</Label>
                <Input id="stat-label-fa" dir="rtl" value={statForm.labelFa} onChange={(e)=> setStatForm(f=>({...f,labelFa:e.target.value}))} className="mt-2 rounded-xl text-right" />
              </div>
            </div>
            <div>
              <Label htmlFor="stat-value">{t('admin.homeContent.stat.valueLabel')}</Label>
              <Input id="stat-value" value={statForm.value} onChange={(e)=> setStatForm(f=>({...f,value:e.target.value.replace(/[^0-9]/g,'')}))} className="mt-2 rounded-xl" />
            </div>
            <div>
              <Label htmlFor="stat-icon">{t('admin.homeContent.stat.iconLabel')}</Label>
              {statForm.icon && (
                <div className="mt-2 mb-2 relative w-20 h-20 rounded-lg overflow-hidden border">
                  {renderIcon(statForm.icon, 'w-full h-full text-black')}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute top-0 right-0 text-red-600 bg-white/80" 
                    onClick={() => { setStatForm(f => ({ ...f, icon: '' })); setDirty(true); }}
                    disabled={statIconProcessing}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              )}
              <div className="flex gap-2 mt-2">
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleStatIconUpload} 
                  disabled={statIconProcessing} 
                  className="rounded-xl flex-1"
                  id="stat-icon-upload"
                />
                <Button 
                  variant="outline" 
                  disabled={statIconProcessing}
                  className="whitespace-nowrap"
                  onClick={() => document.getElementById('stat-icon-upload')?.click()}
                >
                  <UploadCloud className={`w-4 h-4 mr-2 ${statIconProcessing ? 'animate-spin' : ''}`} />
                  {statIconProcessing ? t('admin.media.uploading') : t('admin.media.upload')}
                </Button>
                <Button 
                  variant="outline" 
                  className="whitespace-nowrap"
                  onClick={() => setStatIconPickerOpen(true)}
                >
                  <Palette className="w-4 h-4 mr-2" />
                  {t('admin.media.chooseIcon') || 'Choose'}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">{t('admin.media.iconHelp') || 'Upload an image or choose a Lucide icon'}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=> { setStatDialogOpen(false); setEditingStat(null);} }>{t('admin.cancel')}</Button>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600" onClick={saveStat}>{editingStat? t('admin.update'): t('admin.create')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feature Dialog */}
  <Dialog open={featureDialogOpen} onOpenChange={(o: boolean)=> { if(!o){ setFeatureDialogOpen(false); setEditingFeature(null);} }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingFeature? t('admin.homeContent.feature.editTitle'): t('admin.homeContent.feature.addTitle')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="feat-title-en">{t('admin.homeContent.feature.titleLabel')} (EN)</Label>
                <Input id="feat-title-en" value={featureForm.titleEn} onChange={(e)=> setFeatureForm(f=>({...f,titleEn:e.target.value}))} className="mt-2 rounded-xl" />
              </div>
              <div>
                <Label htmlFor="feat-title-fa">{t('admin.homeContent.feature.titleLabel')} (FA)</Label>
                <Input id="feat-title-fa" dir="rtl" value={featureForm.titleFa} onChange={(e)=> setFeatureForm(f=>({...f,titleFa:e.target.value}))} className="mt-2 rounded-xl text-right" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="feat-desc-en">{t('admin.homeContent.feature.descriptionLabel')} (EN)</Label>
                <Textarea id="feat-desc-en" value={featureForm.descriptionEn} onChange={(e)=> setFeatureForm(f=>({...f,descriptionEn:e.target.value}))} className="mt-2 rounded-xl" rows={3} />
              </div>
              <div>
                <Label htmlFor="feat-desc-fa">{t('admin.homeContent.feature.descriptionLabel')} (FA)</Label>
                <Textarea id="feat-desc-fa" dir="rtl" value={featureForm.descriptionFa} onChange={(e)=> setFeatureForm(f=>({...f,descriptionFa:e.target.value}))} className="mt-2 rounded-xl text-right" rows={3} />
              </div>
            </div>
            <div>
              <Label htmlFor="feat-icon">{t('admin.homeContent.feature.iconLabel')}</Label>
              {featureForm.icon && (
                <div className="mt-2 mb-2 relative w-20 h-20 rounded-lg overflow-hidden border">
                  {renderIcon(featureForm.icon, 'w-full h-full text-black')}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute top-0 right-0 text-red-600 bg-white/80" 
                    onClick={() => { setFeatureForm(f => ({ ...f, icon: '' })); setDirty(true); }}
                    disabled={featureIconProcessing}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              )}
              <div className="flex gap-2 mt-2">
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFeatureIconUpload} 
                  disabled={featureIconProcessing} 
                  className="rounded-xl flex-1"
                  id="feature-icon-upload"
                />
                <Button 
                  variant="outline" 
                  disabled={featureIconProcessing}
                  className="whitespace-nowrap"
                  onClick={() => document.getElementById('feature-icon-upload')?.click()}
                >
                  <UploadCloud className={`w-4 h-4 mr-2 ${featureIconProcessing ? 'animate-spin' : ''}`} />
                  {featureIconProcessing ? t('admin.media.uploading') : t('admin.media.upload')}
                </Button>
                <Button 
                  variant="outline" 
                  className="whitespace-nowrap"
                  onClick={() => setFeatureIconPickerOpen(true)}
                >
                  <Palette className="w-4 h-4 mr-2" />
                  {t('admin.media.chooseIcon') || 'Choose'}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">{t('admin.media.iconHelp') || 'Upload an image or choose a Lucide icon'}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=> { setFeatureDialogOpen(false); setEditingFeature(null);} }>{t('admin.cancel')}</Button>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600" onClick={saveFeature}>{editingFeature? t('admin.update'): t('admin.create')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Icon Pickers */}
      <IconPicker
        open={statIconPickerOpen}
        onOpenChange={setStatIconPickerOpen}
        onSelect={(iconName) => { setStatForm(f => ({ ...f, icon: iconName })); setDirty(true); }}
        currentIcon={statForm.icon}
      />
      <IconPicker
        open={featureIconPickerOpen}
        onOpenChange={setFeatureIconPickerOpen}
        onSelect={(iconName) => { setFeatureForm(f => ({ ...f, icon: iconName })); setDirty(true); }}
        currentIcon={featureForm.icon}
      />
    </div>
  );
}
