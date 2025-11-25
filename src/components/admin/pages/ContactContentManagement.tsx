import { ChangeEvent, useEffect, useState } from 'react';
import { Phone, Mail, MapPin, Clock, HelpCircle, Plus, Edit, Trash2, Save, RefreshCcw, Share2, Link as LinkIcon, Map as MapIcon, Target, UploadCloud, Palette } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Badge } from '../../ui/badge';
// Use existing sonner setup (import path without version tag)
import { toast } from 'sonner';
import { apiFetch } from '../../../api/client';
import { useLanguage } from '../../LanguageContext';
import { resolveMediaUrl } from '../../../utils/media';
import { IconPicker } from '../IconPicker';

// Types based on backend schema
type ContactInfoType = 'phone' | 'email' | 'address' | 'hours';

interface ContactInfoValue { id?: string; value: string; valueEn?: string | null; valueFa?: string | null }
interface ContactInfoBlock {
  id?: string;
  type: ContactInfoType;
  title: string;
  titleEn?: string | null;
  titleFa?: string | null;
  values: ContactInfoValue[];
}
interface ContactFaq {
  id?: string;
  question: string;
  questionEn?: string | null;
  questionFa?: string | null;
  answer: string;
  answerEn?: string | null;
  answerFa?: string | null;
}
interface SocialLink {
  id?: string;
  platform: string;
  platformEn?: string | null;
  platformFa?: string | null;
  url: string;
  icon?: string | null;
}
interface QuickAction {
  id?: string;
  label: string;
  labelEn?: string | null;
  labelFa?: string | null;
  type: 'call' | 'email' | 'chat' | 'custom';
  target: string;
}
interface ContactMapConfig {
  latitude?: number | null;
  longitude?: number | null;
  zoom?: number | null;
  markerLabel?: string | null;
}
interface ContactData { blocks: ContactInfoBlock[]; faq: ContactFaq[]; social: SocialLink[]; quickActions: QuickAction[]; map?: ContactMapConfig | null }

const pickInput = (...values: Array<string | null | undefined>) => {
  for (const value of values) {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length) return trimmed;
    }
  }
  return '';
};
const trimOrNull = (value?: string | null) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};
const canonicalFrom = (fa?: string | null, en?: string | null, fallback?: string | null) => trimOrNull(fa) || trimOrNull(en) || trimOrNull(fallback);

const hydrateBlocks = (blocks?: ContactInfoBlock[] | null): ContactInfoBlock[] =>
  (blocks || []).map((block) => ({
    ...block,
    title: pickInput(block.title, block.titleFa, block.titleEn),
    titleEn: pickInput(block.titleEn, block.title),
    titleFa: pickInput(block.titleFa, block.title),
    values: (block.values || []).map((value) => ({
      ...value,
      value: pickInput(value.value, value.valueFa, value.valueEn),
      valueEn: pickInput(value.valueEn, value.value),
      valueFa: pickInput(value.valueFa, value.value),
    })),
  }));

const hydrateFaq = (faq?: ContactFaq[] | null): ContactFaq[] =>
  (faq || []).map((item) => ({
    ...item,
    question: pickInput(item.question, item.questionFa, item.questionEn),
    questionEn: pickInput(item.questionEn, item.question),
    questionFa: pickInput(item.questionFa, item.question),
    answer: pickInput(item.answer, item.answerFa, item.answerEn),
    answerEn: pickInput(item.answerEn, item.answer),
    answerFa: pickInput(item.answerFa, item.answer),
  }));

const hydrateSocial = (items?: SocialLink[] | null): SocialLink[] =>
  (items || []).map((item) => ({
    ...item,
    platform: pickInput(item.platform, item.platformFa, item.platformEn),
    platformEn: pickInput(item.platformEn, item.platform),
    platformFa: pickInput(item.platformFa, item.platform),
    url: pickInput(item.url),
    icon: trimOrNull(item.icon) || undefined,
  }));

const hydrateQuickActions = (items?: QuickAction[] | null): QuickAction[] =>
  (items || []).map((item) => ({
    ...item,
    label: pickInput(item.label, item.labelFa, item.labelEn),
    labelEn: pickInput(item.labelEn, item.label),
    labelFa: pickInput(item.labelFa, item.label),
    target: pickInput(item.target),
    type: (item.type as QuickAction['type']) || 'call',
  }));

const hydrateMap = (map?: ContactMapConfig | null) => ({
  latitude: map?.latitude ?? null,
  longitude: map?.longitude ?? null,
  zoom: map?.zoom ?? 15,
  markerLabel: pickInput(map?.markerLabel) || '',
});

const buildBilingualPair = (fa?: string | null, en?: string | null, fallback?: string | null) => ({
  fa: pickInput(fa, fallback),
  en: pickInput(en, fallback),
});

const BilingualPreview = ({ fa, en, dense = false }: { fa?: string | null; en?: string | null; dense?: boolean }) => {
  const faText = fa?.trim() ? fa : '—';
  const enText = en?.trim() ? en : '—';
  const padding = dense ? 'py-1' : 'py-2';
  const textSize = dense ? 'text-xs' : 'text-sm';
  return (
    <div className="space-y-1">
      <div className="grid grid-cols-2 gap-2 text-[11px] uppercase tracking-wide text-gray-500">
        <span>FA</span>
        <span>EN</span>
      </div>
      <div className={`grid grid-cols-2 gap-2 ${textSize} text-gray-900`}>
        <div dir="rtl" className={`rounded-lg bg-gray-50 px-2 ${padding} min-h-[1.75rem] flex items-center`}>{faText}</div>
        <div className={`rounded-lg bg-gray-50 px-2 ${padding} min-h-[1.75rem] flex items-center`}>{enText}</div>
      </div>
    </div>
  );
};

export function ContactContentManagement() {
  const { t } = useLanguage();
  const [data, setData] = useState<ContactData>({ blocks: [], faq: [], social: [], quickActions: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [dirty, setDirty] = useState(false);

  // Local editable copies
  const [blocks, setBlocks] = useState<ContactInfoBlock[]>([]);
  const [faq, setFaq] = useState<ContactFaq[]>([]);
  const [social, setSocial] = useState<SocialLink[]>([]);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [mapConfig, setMapConfig] = useState<{ latitude: string; longitude: string; zoom: string; markerLabel: string }>({ latitude: '', longitude: '', zoom: '15', markerLabel: '' });
  const socialIconUploadInputId = 'contact-social-icon-upload';

  // Dialog states & forms
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<ContactInfoBlock|null>(null);
  const [blockForm, setBlockForm] = useState<{ type: ContactInfoType; titleEn: string; titleFa: string; values: Array<{ valueEn: string; valueFa: string }> }>({ type: 'phone', titleEn: '', titleFa: '', values: [{ valueEn: '', valueFa: '' }] });

  const [faqDialogOpen, setFaqDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<ContactFaq|null>(null);
  const [faqForm, setFaqForm] = useState<{ questionEn: string; questionFa: string; answerEn: string; answerFa: string }>({ questionEn: '', questionFa: '', answerEn: '', answerFa: '' });

  const [socialDialogOpen, setSocialDialogOpen] = useState(false);
  const [editingSocial, setEditingSocial] = useState<SocialLink|null>(null);
  const [socialForm, setSocialForm] = useState<{ platformEn: string; platformFa: string; url: string; icon: string }>({ platformEn: '', platformFa: '', url: '', icon: '' });
  const [socialIconPickerOpen, setSocialIconPickerOpen] = useState(false);
  const [socialIconProcessing, setSocialIconProcessing] = useState(false);

  const [quickDialogOpen, setQuickDialogOpen] = useState(false);
  const [editingQuick, setEditingQuick] = useState<QuickAction|null>(null);
  const [quickForm, setQuickForm] = useState<{ labelEn: string; labelFa: string; type: QuickAction['type']; target: string }>({ labelEn: '', labelFa: '', type: 'call', target: '' });

  const fetchContact = async () => {
    try {
      setLoading(true); setError(null);
      const res = await apiFetch<ContactData>('/contact');
      const normalized: ContactData = {
        blocks: hydrateBlocks(res.blocks),
        faq: hydrateFaq(res.faq),
        social: hydrateSocial(res.social),
        quickActions: hydrateQuickActions(res.quickActions),
        map: res.map ? hydrateMap(res.map) : hydrateMap(),
      };
      setData(normalized);
      setBlocks(normalized.blocks || []);
      setFaq(normalized.faq || []);
      setSocial(normalized.social || []);
      setQuickActions(normalized.quickActions || []);
      setMapConfig({
        latitude: normalized.map?.latitude != null ? String(normalized.map.latitude) : '',
        longitude: normalized.map?.longitude != null ? String(normalized.map.longitude) : '',
        zoom: normalized.map?.zoom != null ? String(normalized.map.zoom) : '15',
        markerLabel: normalized.map?.markerLabel || '',
      });
      setDirty(false);
    } catch (e: any) {
  setError(e?.message || t('admin.contactContent.loadFailed'));
    } finally { setLoading(false); }
  };
  useEffect(()=>{ fetchContact(); }, []);

  // Block handlers
  const openNewBlock = () => {
    setEditingBlock(null);
    setBlockForm({ type: 'phone', titleEn: '', titleFa: '', values: [{ valueEn: '', valueFa: '' }] });
    setBlockDialogOpen(true);
  };
  const openEditBlock = (b: ContactInfoBlock) => {
    setEditingBlock(b);
    setBlockForm({
      type: b.type,
      titleEn: b.titleEn || b.title || '',
      titleFa: b.titleFa || b.title || '',
      values: (b.values.length ? b.values : [{ valueEn: '', valueFa: '' }]).map((val) => ({
        valueEn: val.valueEn || val.value || '',
        valueFa: val.valueFa || val.value || '',
      })),
    });
    setBlockDialogOpen(true);
  };
  const saveBlock = () => {
    if (!blockForm.titleEn.trim() && !blockForm.titleFa.trim()) { toast.error(t('admin.contactContent.blockTitleRequired')); return; }
    const normalizedValues = blockForm.values
      .map((val, index) => {
        const canonical = val.valueFa.trim() || val.valueEn.trim();
        if (!canonical) return null;
        return {
          id: editingBlock?.values?.[index]?.id || crypto.randomUUID(),
          value: canonical,
          valueEn: val.valueEn.trim() || null,
          valueFa: val.valueFa.trim() || null,
        } as ContactInfoValue;
      })
      .filter(Boolean) as ContactInfoValue[];
    if (!normalizedValues.length) { toast.error(t('admin.contactContent.blockValueRequired')); return; }
    const canonicalTitle = blockForm.titleFa.trim() || blockForm.titleEn.trim();
    const payload: ContactInfoBlock = {
      id: editingBlock?.id || crypto.randomUUID(),
      type: blockForm.type,
      title: canonicalTitle || 'Contact Block',
      titleEn: blockForm.titleEn.trim() || null,
      titleFa: blockForm.titleFa.trim() || null,
      values: normalizedValues,
    };
    if (editingBlock) {
      setBlocks(prev => prev.map(x => x === editingBlock ? payload : x));
    } else {
      setBlocks(prev => [...prev, payload]);
    }
    setBlockDialogOpen(false); setEditingBlock(null); setDirty(true);
  };
  const deleteBlock = (b: ContactInfoBlock) => { if (!confirm(t('admin.contactContent.deleteBlockConfirm'))) return; setBlocks(prev => prev.filter(x => x !== b)); setDirty(true); };
  const addBlockValueRow = () => setBlockForm(f=>({ ...f, values: [...f.values, { valueEn: '', valueFa: '' }] }));
  const updateBlockValue = (i: number, field: 'valueEn' | 'valueFa', val: string) => setBlockForm(f=>({ ...f, values: f.values.map((v,idx)=> idx===i? { ...v, [field]: val } : v) }));
  const removeBlockValue = (i: number) => setBlockForm(f=>({ ...f, values: f.values.filter((_,idx)=> idx!==i) }));

  // FAQ handlers
  const openNewFaq = () => { setEditingFaq(null); setFaqForm({ questionEn: '', questionFa: '', answerEn: '', answerFa: '' }); setFaqDialogOpen(true); };
  const openEditFaq = (f: ContactFaq) => {
    setEditingFaq(f);
    setFaqForm({
      questionEn: f.questionEn || f.question || '',
      questionFa: f.questionFa || f.question || '',
      answerEn: f.answerEn || f.answer || '',
      answerFa: f.answerFa || f.answer || '',
    });
    setFaqDialogOpen(true);
  };
  const saveFaq = () => {
    if ((!faqForm.questionEn.trim() && !faqForm.questionFa.trim()) || (!faqForm.answerEn.trim() && !faqForm.answerFa.trim())) { toast.error(t('admin.contactContent.faqRequired')); return; }
    const payload: ContactFaq = {
      id: editingFaq?.id || crypto.randomUUID(),
      question: faqForm.questionFa.trim() || faqForm.questionEn.trim() || 'FAQ',
      questionEn: faqForm.questionEn.trim() || null,
      questionFa: faqForm.questionFa.trim() || null,
      answer: faqForm.answerFa.trim() || faqForm.answerEn.trim() || '',
      answerEn: faqForm.answerEn.trim() || null,
      answerFa: faqForm.answerFa.trim() || null,
    };
    if (editingFaq) setFaq(prev => prev.map(x => x === editingFaq ? payload : x));
    else setFaq(prev => [...prev, payload]);
    setFaqDialogOpen(false); setEditingFaq(null); setDirty(true);
  };
  const deleteFaq = (f: ContactFaq) => { if (!confirm(t('admin.contactContent.deleteFaqConfirm'))) return; setFaq(prev => prev.filter(x => x !== f)); setDirty(true); };

  // Social handlers
  const openNewSocial = () => { setEditingSocial(null); setSocialForm({ platformEn: '', platformFa: '', url: '', icon: '' }); setSocialDialogOpen(true); };
  const openEditSocial = (s: SocialLink) => {
    setEditingSocial(s);
    setSocialForm({
      platformEn: s.platformEn || s.platform || '',
      platformFa: s.platformFa || s.platform || '',
      url: s.url || '',
      icon: s.icon || '',
    });
    setSocialDialogOpen(true);
  };
  const saveSocial = () => {
    if (!socialForm.platformEn.trim() && !socialForm.platformFa.trim()) { toast.error(t('admin.contactContent.socialRequired')); return; }
    if (!socialForm.url.trim()) { toast.error(t('admin.contactContent.socialRequired')); return; }
    const payload: SocialLink = {
      id: editingSocial?.id || crypto.randomUUID(),
      platform: socialForm.platformFa.trim() || socialForm.platformEn.trim() || 'Social',
      platformEn: socialForm.platformEn.trim() || null,
      platformFa: socialForm.platformFa.trim() || null,
      url: socialForm.url.trim(),
      icon: socialForm.icon.trim() || null,
    };
    if (editingSocial) setSocial(prev => prev.map(x => x === editingSocial ? payload : x));
    else setSocial(prev => [...prev, payload]);
    setSocialDialogOpen(false); setEditingSocial(null); setDirty(true);
  };
  const deleteSocial = (s: SocialLink) => { if (!confirm(t('admin.contactContent.deleteSocialConfirm'))) return; setSocial(prev => prev.filter(x => x !== s)); setDirty(true); };

  // Quick action handlers
  const openNewQuick = () => { setEditingQuick(null); setQuickForm({ labelEn: '', labelFa: '', type: 'call', target: '' }); setQuickDialogOpen(true); };
  const openEditQuick = (q: QuickAction) => {
    setEditingQuick(q);
    setQuickForm({ labelEn: q.labelEn || q.label || '', labelFa: q.labelFa || q.label || '', type: (q.type as QuickAction['type']) || 'call', target: q.target || '' });
    setQuickDialogOpen(true);
  };
  const saveQuick = () => {
    if ((!quickForm.labelEn.trim() && !quickForm.labelFa.trim()) || !quickForm.target.trim()) { toast.error(t('admin.contactContent.quickRequired')); return; }
    const payload: QuickAction = {
      id: editingQuick?.id || crypto.randomUUID(),
      label: quickForm.labelFa.trim() || quickForm.labelEn.trim() || 'Action',
      labelEn: quickForm.labelEn.trim() || null,
      labelFa: quickForm.labelFa.trim() || null,
      type: quickForm.type,
      target: quickForm.target.trim(),
    };
    if (editingQuick) setQuickActions(prev => prev.map(x => x === editingQuick ? payload : x));
    else setQuickActions(prev => [...prev, payload]);
    setQuickDialogOpen(false); setEditingQuick(null); setDirty(true);
  };
  const deleteQuick = (q: QuickAction) => { if (!confirm(t('admin.contactContent.deleteQuickConfirm'))) return; setQuickActions(prev => prev.filter(x => x !== q)); setDirty(true); };

  const saveAll = async () => {
    try {
      const latNumber = Number(mapConfig.latitude);
      const lngNumber = Number(mapConfig.longitude);
      const zoomNumber = Number(mapConfig.zoom);
      const mapPayload = {
        latitude: Number.isFinite(latNumber) ? latNumber : null,
        longitude: Number.isFinite(lngNumber) ? lngNumber : null,
        zoom: Number.isFinite(zoomNumber) ? zoomNumber : null,
        markerLabel: trimOrNull(mapConfig.markerLabel),
      };
      const payload = {
        blocks: blocks.map(b => ({
          id: b.id,
          type: b.type,
          title: canonicalFrom(b.titleFa, b.titleEn, b.title),
          titleEn: trimOrNull(b.titleEn),
          titleFa: trimOrNull(b.titleFa),
          values: (b.values || []).map(v => ({
            id: v.id,
            value: canonicalFrom(v.valueFa, v.valueEn, v.value),
            valueEn: trimOrNull(v.valueEn),
            valueFa: trimOrNull(v.valueFa),
          })).filter(v => v.value),
        })),
        faq: faq.map(f => ({
          id: f.id,
          question: canonicalFrom(f.questionFa, f.questionEn, f.question),
          questionEn: trimOrNull(f.questionEn),
          questionFa: trimOrNull(f.questionFa),
          answer: canonicalFrom(f.answerFa, f.answerEn, f.answer),
          answerEn: trimOrNull(f.answerEn),
          answerFa: trimOrNull(f.answerFa),
        })),
        social: social.map(s => ({
          id: s.id,
          platform: canonicalFrom(s.platformFa, s.platformEn, s.platform),
          platformEn: trimOrNull(s.platformEn),
          platformFa: trimOrNull(s.platformFa),
          url: trimOrNull(s.url),
          icon: trimOrNull(s.icon),
        })),
        quickActions: quickActions.map(q => ({
          id: q.id,
          label: canonicalFrom(q.labelFa, q.labelEn, q.label),
          labelEn: trimOrNull(q.labelEn),
          labelFa: trimOrNull(q.labelFa),
          type: q.type,
          target: trimOrNull(q.target),
        })),
        map: mapPayload,
      };
      await apiFetch('/contact', { method: 'PUT', body: payload });
  toast.success(t('admin.contactContent.saved'));
      setDirty(false);
      await fetchContact();
  } catch (e: any) { toast.error(e?.message || t('admin.contactContent.saveFailed')); }
  };

  const resetChanges = () => {
    setBlocks(hydrateBlocks(data.blocks));
    setFaq(hydrateFaq(data.faq));
    setSocial(hydrateSocial(data.social));
    setQuickActions(hydrateQuickActions(data.quickActions));
    const nextMap = data.map ? hydrateMap(data.map) : hydrateMap();
    setMapConfig({
      latitude: nextMap.latitude != null ? String(nextMap.latitude) : '',
      longitude: nextMap.longitude != null ? String(nextMap.longitude) : '',
      zoom: nextMap.zoom != null ? String(nextMap.zoom) : '15',
      markerLabel: nextMap.markerLabel || '',
    });
    setDirty(false);
  };

  const updateMapField = (field: 'latitude' | 'longitude' | 'zoom' | 'markerLabel', value: string) => {
    setMapConfig((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const lucideIconByName = (name?: string | null) => {
    if (!name) return null;
    return (LucideIcons as Record<string, any>)[name] || null;
  };

  const renderSocialIconPreview = (iconValue?: string | null) => {
    const trimmed = iconValue?.trim();
    if (!trimmed) return <Share2 className="w-6 h-6 text-gray-400" />;
    if (trimmed.startsWith('lucide:')) {
      const IconComponent = lucideIconByName(trimmed.replace('lucide:', ''));
      if (IconComponent) return <IconComponent className="w-6 h-6 text-pink-500" />;
    }
    if (/^data:/i.test(trimmed) || trimmed.startsWith('/') || /^https?:/i.test(trimmed)) {
      return <img src={resolveMediaUrl(trimmed)} alt="icon preview" className="w-full h-full object-contain" />;
    }
    const IconComponent = lucideIconByName(trimmed);
    if (IconComponent) return <IconComponent className="w-6 h-6 text-pink-500" />;
    return <Share2 className="w-6 h-6 text-gray-400" />;
  };

  const handleSocialIconUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setSocialIconProcessing(true);
      const formData = new FormData();
      formData.append('file', file);
      const alt = socialForm.platformFa || socialForm.platformEn || 'Social icon';
      if (alt) formData.append('alt', alt);
      const result = await apiFetch<{ url: string; publicUrl?: string | null }>('/media/upload', {
        method: 'POST',
        body: formData,
      });
      if (result?.url) {
        setSocialForm((prev) => ({ ...prev, icon: result.url }));
        toast.success(t('admin.media.uploaded'));
      }
    } catch (e: any) {
      toast.error(e?.message || t('admin.media.uploadFailed'));
    } finally {
      setSocialIconProcessing(false);
      event.target.value = '';
    }
  };

  const hasCoordinates = mapConfig.latitude.trim().length && mapConfig.longitude.trim().length;
  const mapEmbedUrl = hasCoordinates
    ? `https://www.google.com/maps?q=${encodeURIComponent(mapConfig.latitude)},${encodeURIComponent(mapConfig.longitude)}&z=${encodeURIComponent(mapConfig.zoom || '15')}&output=embed`
    : null;

  const blockIcon = (type: ContactInfoBlock['type']) => {
    switch (type) {
      case 'phone': return <Phone className="w-4 h-4 text-pink-500" />;
      case 'email': return <Mail className="w-4 h-4 text-purple-500" />;
      case 'address': return <MapPin className="w-4 h-4 text-indigo-500" />;
      case 'hours': return <Clock className="w-4 h-4 text-green-600" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-gray-900">{t('admin.contactContent.title')}</h1>
          <p className="text-gray-600">{t('admin.contactContent.subtitle')}</p>
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
          {/* Info Blocks */}
          <Card className="p-6 border-0 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-gray-900 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-pink-500" />{t('admin.contactContent.blocksSection')}</h2>
              <Button size="sm" onClick={openNewBlock} className="rounded-xl"><Plus className="w-4 h-4 mr-2" />{t('admin.contactContent.addBlock')}</Button>
            </div>
            {blocks.length === 0 && <p className="text-gray-500">{t('admin.contactContent.noBlocks')}</p>}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {blocks.map((b, idx) => {
                const titlePair = buildBilingualPair(b.titleFa, b.titleEn, b.title);
                return (
                  <Card key={(b.id||'')+idx} className="p-4 relative group space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {blockIcon(b.type)}
                        <span className="font-medium text-gray-900" title={titlePair.fa || titlePair.en || b.title}>{titlePair.fa || titlePair.en || b.title}</span>
                      </div>
                      <Badge className="bg-purple-100 text-purple-700 capitalize">{b.type}</Badge>
                    </div>
                    <BilingualPreview fa={titlePair.fa} en={titlePair.en} />
                    <ul className="space-y-3">
                      {b.values.map((v,i)=>{
                        const valuePair = buildBilingualPair(v.valueFa, v.valueEn, v.value);
                        return (
                          <li key={(v.id||'')+i}>
                            <BilingualPreview fa={valuePair.fa} en={valuePair.en} dense />
                          </li>
                        );
                      })}
                    </ul>
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="sm" onClick={()=> openEditBlock(b)} className="rounded-md"><Edit className="w-4 h-4" /></Button>
                      <Button variant="outline" size="sm" onClick={()=> deleteBlock(b)} className="rounded-md text-red-600"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </Card>

          {/* FAQ */}
            <Card className="p-6 border-0 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-gray-900 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-indigo-500" />{t('admin.contactContent.faqSection')}</h2>
                <Button size="sm" onClick={openNewFaq} className="rounded-xl"><Plus className="w-4 h-4 mr-2" />{t('admin.contactContent.addFaq')}</Button>
              </div>
              {faq.length === 0 && <p className="text-gray-500">{t('admin.contactContent.noFaq')}</p>}
              <div className="space-y-4">
                {faq.map((f, idx) => {
                  const questionPair = buildBilingualPair(f.questionFa, f.questionEn, f.question);
                  const answerPair = buildBilingualPair(f.answerFa, f.answerEn, f.answer);
                  return (
                    <Card key={(f.id||'')+idx} className="p-4 relative group space-y-4">
                      <div>
                        <p className="text-xs uppercase text-gray-500 mb-1">{t('admin.contactContent.faq.questionLabel')}</p>
                        <BilingualPreview fa={questionPair.fa} en={questionPair.en} />
                      </div>
                      <div>
                        <p className="text-xs uppercase text-gray-500 mb-1">{t('admin.contactContent.faq.answerLabel')}</p>
                        <BilingualPreview fa={answerPair.fa} en={answerPair.en} dense />
                      </div>
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="outline" size="sm" onClick={()=> openEditFaq(f)} className="rounded-md"><Edit className="w-4 h-4" /></Button>
                        <Button variant="outline" size="sm" onClick={()=> deleteFaq(f)} className="rounded-md text-red-600"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </Card>

          {/* Social Links */}
          <Card className="p-6 border-0 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-gray-900 flex items-center gap-2"><Share2 className="w-5 h-5 text-green-600" />{t('admin.contactContent.socialSection')}</h2>
              <Button size="sm" onClick={openNewSocial} className="rounded-xl"><Plus className="w-4 h-4 mr-2" />{t('admin.contactContent.addSocial')}</Button>
            </div>
            {social.length === 0 && <p className="text-gray-500">{t('admin.contactContent.noSocial')}</p>}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {social.map((s, idx) => {
                const platformPair = buildBilingualPair(s.platformFa, s.platformEn, s.platform);
                const iconBadgeText = s.icon
                  ? (s.icon.startsWith('lucide:')
                      ? t('admin.contactContent.social.iconSourceLucide')
                      : t('admin.contactContent.social.iconSourceUpload'))
                  : t('admin.contactContent.social.iconSourceNone');
                return (
                  <Card key={(s.id||'')+idx} className="p-4 relative group space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                          {renderSocialIconPreview(s.icon)}
                        </div>
                        <span className="font-medium text-gray-900 line-clamp-1" title={platformPair.fa || platformPair.en}>{platformPair.fa || platformPair.en || '—'}</span>
                      </div>
                      <Badge className="bg-pink-100 text-pink-700 whitespace-nowrap">{iconBadgeText}</Badge>
                    </div>
                    <BilingualPreview fa={platformPair.fa} en={platformPair.en} dense />
                    <a href={s.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline break-all flex items-center gap-1"><LinkIcon className="w-3 h-3" />{s.url}</a>
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="sm" onClick={()=> openEditSocial(s)} className="rounded-md"><Edit className="w-4 h-4" /></Button>
                      <Button variant="outline" size="sm" onClick={()=> deleteSocial(s)} className="rounded-md text-red-600"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6 border-0 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-gray-900 flex items-center gap-2"><Phone className="w-5 h-5 text-purple-600" />{t('admin.contactContent.quickSection')}</h2>
              <Button size="sm" onClick={openNewQuick} className="rounded-xl"><Plus className="w-4 h-4 mr-2" />{t('admin.contactContent.addQuick')}</Button>
            </div>
            {quickActions.length === 0 && <p className="text-gray-500">{t('admin.contactContent.noQuick')}</p>}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((q, idx) => {
                const labelPair = buildBilingualPair(q.labelFa, q.labelEn, q.label);
                return (
                  <Card key={(q.id||'')+idx} className="p-4 relative group space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 line-clamp-1" title={labelPair.fa || labelPair.en}>{labelPair.fa || labelPair.en || '—'}</span>
                      <Badge className="bg-indigo-100 text-indigo-700 capitalize">{q.type}</Badge>
                    </div>
                    <BilingualPreview fa={labelPair.fa} en={labelPair.en} dense />
                    <p className="text-sm text-gray-600 break-all">{q.target}</p>
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="sm" onClick={()=> openEditQuick(q)} className="rounded-md"><Edit className="w-4 h-4" /></Button>
                      <Button variant="outline" size="sm" onClick={()=> deleteQuick(q)} className="rounded-md text-red-600"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </Card>

          {/* Map Configuration */}
          <Card className="p-6 border-0 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-gray-900 flex items-center gap-2"><MapIcon className="w-5 h-5 text-blue-600" />{t('admin.contactContent.mapSection')}</h2>
              <div className="text-sm text-gray-500 flex items-center gap-2"><Target className="w-4 h-4" />{t('admin.contactContent.mapHint')}</div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="map-lat">{t('admin.contactContent.map.latitude')}</Label>
                <Input id="map-lat" value={mapConfig.latitude} onChange={(e)=> updateMapField('latitude', e.target.value)} className="mt-2 rounded-xl" placeholder="35.757093" />
              </div>
              <div>
                <Label htmlFor="map-lng">{t('admin.contactContent.map.longitude')}</Label>
                <Input id="map-lng" value={mapConfig.longitude} onChange={(e)=> updateMapField('longitude', e.target.value)} className="mt-2 rounded-xl" placeholder="51.409537" />
              </div>
              <div>
                <Label htmlFor="map-zoom">{t('admin.contactContent.map.zoom')}</Label>
                <Input id="map-zoom" value={mapConfig.zoom} onChange={(e)=> updateMapField('zoom', e.target.value)} className="mt-2 rounded-xl" placeholder="16" />
              </div>
              <div>
                <Label htmlFor="map-marker">{t('admin.contactContent.map.markerLabel')}</Label>
                <Input id="map-marker" value={mapConfig.markerLabel} onChange={(e)=> updateMapField('markerLabel', e.target.value)} className="mt-2 rounded-xl" placeholder="Ava Beauty Clinic" />
              </div>
            </div>
            {mapEmbedUrl ? (
              <div className="mt-4 rounded-2xl overflow-hidden border border-gray-200 shadow-inner">
                <iframe
                  title="Contact Map Preview"
                  src={mapEmbedUrl}
                  width="100%"
                  height="320"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            ) : (
              <div className="mt-2 p-4 text-sm text-gray-500 bg-gray-50 rounded-xl">{t('admin.contactContent.map.placeholder')}</div>
            )}
          </Card>
        </>
      )}

      {/* Block Dialog */}
  <Dialog open={blockDialogOpen} onOpenChange={(o: boolean)=> { if(!o){ setBlockDialogOpen(false); setEditingBlock(null);} }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingBlock? t('admin.contactContent.block.editTitle'): t('admin.contactContent.block.addTitle')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="blk-type">{t('admin.contactContent.block.typeLabel')}</Label>
                <select id="blk-type" value={blockForm.type} onChange={(e)=> setBlockForm(f=>({ ...f, type: e.target.value as any }))} className="mt-2 rounded-xl w-full border-gray-300">
                  <option value="phone">phone</option>
                  <option value="email">email</option>
                  <option value="address">address</option>
                  <option value="hours">hours</option>
                </select>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="blk-title-en">{t('admin.contactContent.block.titleLabel')} (EN)</Label>
                  <Input id="blk-title-en" value={blockForm.titleEn} onChange={(e)=> setBlockForm(f=>({ ...f, titleEn: e.target.value }))} className="mt-2 rounded-xl" />
                </div>
                <div>
                  <Label htmlFor="blk-title-fa">{t('admin.contactContent.block.titleLabel')} (FA)</Label>
                  <Input dir="rtl" id="blk-title-fa" value={blockForm.titleFa} onChange={(e)=> setBlockForm(f=>({ ...f, titleFa: e.target.value }))} className="mt-2 rounded-xl text-right" />
                </div>
              </div>
            </div>
            <div>
              <Label>{t('admin.contactContent.block.valuesLabel')}</Label>
              <div className="space-y-3 mt-2">
                {blockForm.values.map((v,i)=>(
                  <div key={i} className="rounded-xl border border-gray-200 p-3 space-y-2">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs uppercase tracking-wide text-gray-500">EN</Label>
                        <Input value={v.valueEn} onChange={(e)=> updateBlockValue(i, 'valueEn', e.target.value)} className="mt-1 rounded-xl" />
                      </div>
                      <div>
                        <Label className="text-xs uppercase tracking-wide text-gray-500">FA</Label>
                        <Input dir="rtl" value={v.valueFa} onChange={(e)=> updateBlockValue(i, 'valueFa', e.target.value)} className="mt-1 rounded-xl text-right" />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm" onClick={()=> removeBlockValue(i)} disabled={blockForm.values.length===1} className="rounded-xl text-red-600">{t('admin.delete')}</Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addBlockValueRow} className="rounded-xl">{t('admin.contactContent.block.addValue')}</Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=> { setBlockDialogOpen(false); setEditingBlock(null);} }>{t('admin.cancel')}</Button>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600" onClick={saveBlock}>{editingBlock? t('admin.update'): t('admin.create')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* FAQ Dialog */}
  <Dialog open={faqDialogOpen} onOpenChange={(o: boolean)=> { if(!o){ setFaqDialogOpen(false); setEditingFaq(null);} }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingFaq? t('admin.contactContent.faq.editTitle'): t('admin.contactContent.faq.addTitle')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="fq-question-en">{t('admin.contactContent.faq.questionLabel')} (EN)</Label>
                <Input id="fq-question-en" value={faqForm.questionEn} onChange={(e)=> setFaqForm(f=>({ ...f, questionEn: e.target.value }))} className="mt-2 rounded-xl" />
              </div>
              <div>
                <Label htmlFor="fq-question-fa">{t('admin.contactContent.faq.questionLabel')} (FA)</Label>
                <Input dir="rtl" id="fq-question-fa" value={faqForm.questionFa} onChange={(e)=> setFaqForm(f=>({ ...f, questionFa: e.target.value }))} className="mt-2 rounded-xl text-right" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="fq-answer-en">{t('admin.contactContent.faq.answerLabel')} (EN)</Label>
                <Textarea id="fq-answer-en" value={faqForm.answerEn} onChange={(e)=> setFaqForm(f=>({ ...f, answerEn: e.target.value }))} className="mt-2 rounded-xl" rows={4} />
              </div>
              <div>
                <Label htmlFor="fq-answer-fa">{t('admin.contactContent.faq.answerLabel')} (FA)</Label>
                <Textarea dir="rtl" id="fq-answer-fa" value={faqForm.answerFa} onChange={(e)=> setFaqForm(f=>({ ...f, answerFa: e.target.value }))} className="mt-2 rounded-xl text-right" rows={4} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=> { setFaqDialogOpen(false); setEditingFaq(null);} }>{t('admin.cancel')}</Button>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600" onClick={saveFaq}>{editingFaq? t('admin.update'): t('admin.create')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Social Dialog */}
  <Dialog open={socialDialogOpen} onOpenChange={(o: boolean)=> { if(!o){ setSocialDialogOpen(false); setEditingSocial(null);} }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingSocial? t('admin.contactContent.social.editTitle'): t('admin.contactContent.social.addTitle')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t('admin.contactContent.social.platformLabel')}</Label>
              <div className="grid sm:grid-cols-2 gap-3 mt-2">
                <Input id="soc-platform-en" value={socialForm.platformEn} onChange={(e)=> setSocialForm(f=>({ ...f, platformEn: e.target.value }))} className="rounded-xl" placeholder="Instagram" />
                <Input dir="rtl" id="soc-platform-fa" value={socialForm.platformFa} onChange={(e)=> setSocialForm(f=>({ ...f, platformFa: e.target.value }))} className="rounded-xl text-right" placeholder="اینستاگرام" />
              </div>
            </div>
            <div>
              <Label htmlFor={socialIconUploadInputId}>{t('admin.contactContent.social.iconLabel')}</Label>
              {socialForm.icon && (
                <div className="mt-3 flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                    {renderSocialIconPreview(socialForm.icon)}
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-600" onClick={()=> setSocialForm(f=>({ ...f, icon: '' }))}>
                    <Trash2 className="w-4 h-4 mr-2" />{t('admin.delete')}
                  </Button>
                </div>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                <Input
                  type="file"
                  accept="image/*"
                  id={socialIconUploadInputId}
                  onChange={handleSocialIconUpload}
                  disabled={socialIconProcessing}
                  className="rounded-xl flex-1"
                />
                <Button
                  variant="outline"
                  disabled={socialIconProcessing}
                  className="whitespace-nowrap"
                  onClick={()=> document.getElementById(socialIconUploadInputId)?.click()}
                >
                  <UploadCloud className={`w-4 h-4 mr-2 ${socialIconProcessing ? 'animate-spin' : ''}`} />
                  {socialIconProcessing ? t('admin.media.uploading') : t('admin.media.upload')}
                </Button>
                <Button
                  variant="outline"
                  className="whitespace-nowrap"
                  onClick={()=> setSocialIconPickerOpen(true)}
                >
                  <Palette className="w-4 h-4 mr-2" />
                  {t('admin.contactContent.social.chooseIcon')}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">{t('admin.contactContent.social.iconHint')}</p>
            </div>
            <div>
              <Label htmlFor="soc-url">{t('admin.contactContent.social.urlLabel')}</Label>
              <Input id="soc-url" value={socialForm.url} onChange={(e)=> setSocialForm(f=>({ ...f, url: e.target.value }))} className="mt-2 rounded-xl" placeholder="https://..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=> { setSocialDialogOpen(false); setEditingSocial(null);} }>{t('admin.cancel')}</Button>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600" onClick={saveSocial}>{editingSocial? t('admin.update'): t('admin.create')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Action Dialog */}
  <Dialog open={quickDialogOpen} onOpenChange={(o: boolean)=> { if(!o){ setQuickDialogOpen(false); setEditingQuick(null);} }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingQuick? t('admin.contactContent.quick.editTitle'): t('admin.contactContent.quick.addTitle')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="qa-label-en">{t('admin.contactContent.quick.labelLabel')} (EN)</Label>
                  <Input id="qa-label-en" value={quickForm.labelEn} onChange={(e)=> setQuickForm(f=>({ ...f, labelEn: e.target.value }))} className="mt-2 rounded-xl" placeholder="Call Now" />
                </div>
                <div>
                  <Label htmlFor="qa-label-fa">{t('admin.contactContent.quick.labelLabel')} (FA)</Label>
                  <Input dir="rtl" id="qa-label-fa" value={quickForm.labelFa} onChange={(e)=> setQuickForm(f=>({ ...f, labelFa: e.target.value }))} className="mt-2 rounded-xl text-right" placeholder="همین حالا تماس بگیرید" />
                </div>
              </div>
              <div>
                <Label htmlFor="qa-type">{t('admin.contactContent.quick.typeLabel')}</Label>
                <select id="qa-type" value={quickForm.type} onChange={(e)=> setQuickForm(f=>({ ...f, type: e.target.value as QuickAction['type'] }))} className="mt-2 rounded-xl w-full border-gray-300">
                  <option value="call">call</option>
                  <option value="email">email</option>
                  <option value="chat">chat</option>
                  <option value="custom">custom</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="qa-target">{t('admin.contactContent.quick.targetLabel')}</Label>
              <Input id="qa-target" value={quickForm.target} onChange={(e)=> setQuickForm(f=>({ ...f, target: e.target.value }))} className="mt-2 rounded-xl" placeholder="tel:+15551234567" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=> { setQuickDialogOpen(false); setEditingQuick(null);} }>{t('admin.cancel')}</Button>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600" onClick={saveQuick}>{editingQuick? t('admin.update'): t('admin.create')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <IconPicker
        open={socialIconPickerOpen}
        onOpenChange={setSocialIconPickerOpen}
        onSelect={(iconName) => setSocialForm(f => ({ ...f, icon: iconName }))}
        currentIcon={socialForm.icon}
      />
    </div>
  );
}
