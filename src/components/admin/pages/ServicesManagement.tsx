import { ChangeEvent, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Briefcase, Plus, Edit, Trash2, DollarSign, Clock, Image as ImageIcon, UploadCloud } from 'lucide-react';
import { Card } from '../../ui/card';
import { useLanguage } from '../../LanguageContext';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../ui/dialog';
import { toast } from 'sonner';
import { apiFetch } from '../../../api/client';
import { resolveMediaUrl } from '../../../utils/media';

type Service = {
  id: string;
  title: string;
  titleEn?: string | null;
  titleFa?: string | null;
  subtitle?: string | null;
  subtitleEn?: string | null;
  subtitleFa?: string | null;
  slug: string;
  description: string;
  descriptionEn?: string | null;
  descriptionFa?: string | null;
  image?: string | null;
  priceRange?: string | null;
  priceRangeEn?: string | null;
  priceRangeFa?: string | null;
  duration?: string | null;
  durationEn?: string | null;
  durationFa?: string | null;
  recovery?: string | null;
  recoveryEn?: string | null;
  recoveryFa?: string | null;
  durationMinutes?: number | null;
  createdAt?: string;
  benefits?: { id: string; text: string; textEn?: string | null; textFa?: string | null }[];
  processSteps?: { id: string; stepNumber: number; title?: string | null; description: string; descriptionEn?: string | null; descriptionFa?: string | null }[];
  faq?: { id: string; question: string; answer: string; questionEn?: string | null; questionFa?: string | null; answerEn?: string | null; answerFa?: string | null }[];
};

type BenefitForm = { textEn: string; textFa: string };
type StepForm = { stepNumber?: number; title?: string; descriptionEn: string; descriptionFa: string };
type FaqForm = { questionEn: string; questionFa: string; answerEn: string; answerFa: string };

const emptyForm = {
  titleEn: '',
  titleFa: '',
  subtitleEn: '',
  subtitleFa: '',
  slug: '',
  descriptionEn: '',
  descriptionFa: '',
  image: '',
  priceRangeEn: '',
  priceRangeFa: '',
  durationEn: '',
  durationFa: '',
  durationMinutes: '',
  recoveryEn: '',
  recoveryFa: '',
};

export function ServicesManagement() {
  const { t } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Hero content state
  const [heroContent, setHeroContent] = useState({
    servicesHeroTitleEn: '',
    servicesHeroTitleFa: '',
    servicesHeroSubtitleEn: '',
    servicesHeroSubtitleFa: '',
  });
  const [heroSaving, setHeroSaving] = useState(false);

  const [form, setForm] = useState<typeof emptyForm>(emptyForm);
  const [benefits, setBenefits] = useState<BenefitForm[]>([]);
  const [steps, setSteps] = useState<StepForm[]>([]);
  const [faqs, setFaqs] = useState<FaqForm[]>([]);
  const [imageUploading, setImageUploading] = useState(false);

  const handleImageFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setImageUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      const alt = form.titleFa || form.titleEn || form.slug;
      if (alt) formData.append('alt', alt);
      formData.append('labels', JSON.stringify(['service']));
      const uploaded = await apiFetch<{ url?: string; publicUrl?: string }>('/media/upload', { method: 'POST', body: formData });
      const nextUrl = uploaded?.url || uploaded?.publicUrl;
      if (nextUrl) {
        setForm((prev) => ({ ...prev, image: nextUrl }));
        toast.success(t('admin.media.uploaded'));
      } else {
        toast.error(t('admin.media.uploadFailed'));
      }
    } catch (e: any) {
      toast.error(e?.message || t('admin.media.uploadFailed'));
    } finally {
      setImageUploading(false);
      event.target.value = '';
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const [servicesData, settingsData] = await Promise.all([
        apiFetch<Service[]>('/services?includeTranslations=1'),
        apiFetch<any>('/settings')
      ]);
      setServices(servicesData);
      
      // Load hero content from settings (stored directly in settings fields)
      const s = settingsData?.settings || {};
      
      setHeroContent({
        servicesHeroTitleEn: s.servicesHeroTitleEn || '',
        servicesHeroTitleFa: s.servicesHeroTitleFa || '',
        servicesHeroSubtitleEn: s.servicesHeroSubtitleEn || '',
        servicesHeroSubtitleFa: s.servicesHeroSubtitleFa || '',
      });
    } catch (e: any) {
  setError(e?.message || t('admin.saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const saveHeroContent = async () => {
    try {
      setHeroSaving(true);
      
      // Save hero content directly to settings fields
      await apiFetch('/settings', {
        method: 'PUT',
        body: { 
          settings: { 
            servicesHeroTitleEn: heroContent.servicesHeroTitleEn,
            servicesHeroTitleFa: heroContent.servicesHeroTitleFa,
            servicesHeroSubtitleEn: heroContent.servicesHeroSubtitleEn,
            servicesHeroSubtitleFa: heroContent.servicesHeroSubtitleFa,
          } 
        }
      });
      
      toast.success(t('admin.heroContentSaved'));
    } catch (e: any) {
      toast.error(e?.message || t('admin.heroContentSaveFailed'));
    } finally {
      setHeroSaving(false);
    }
  };

  const openAddDialog = () => {
    setEditingService(null);
    setForm({ ...emptyForm });
    setBenefits([]);
    setSteps([]);
    setFaqs([]);
    setIsDialogOpen(true);
  };

  const openEditDialog = (svc: Service) => {
    setEditingService(svc);
    setForm({
      titleEn: svc.titleEn || svc.title || '',
      titleFa: svc.titleFa || svc.title || '',
      subtitleEn: svc.subtitleEn || svc.subtitle || '',
      subtitleFa: svc.subtitleFa || svc.subtitle || '',
      slug: svc.slug,
      descriptionEn: svc.descriptionEn || svc.description || '',
      descriptionFa: svc.descriptionFa || svc.description || '',
      image: svc.image || '',
      priceRangeEn: (svc as any).priceRangeEn || svc.priceRange || '',
      priceRangeFa: (svc as any).priceRangeFa || svc.priceRange || '',
      durationEn: (svc as any).durationEn || svc.duration || '',
      durationFa: (svc as any).durationFa || svc.duration || '',
      durationMinutes: svc.durationMinutes ? String(svc.durationMinutes) : '',
      recoveryEn: (svc as any).recoveryEn || svc.recovery || '',
      recoveryFa: (svc as any).recoveryFa || svc.recovery || '',
    });
    setBenefits((svc.benefits || []).map((b: any) => ({
      textEn: b.textEn || b.text || '',
      textFa: b.textFa || b.text || '',
    })));
    setSteps((svc.processSteps || [])
      .sort((a, b) => (a.stepNumber ?? 0) - (b.stepNumber ?? 0))
      .map((s: any) => ({
        stepNumber: s.stepNumber,
        title: s.title || '',
        descriptionEn: s.descriptionEn || s.description || '',
        descriptionFa: s.descriptionFa || s.description || '',
      })));
    setFaqs((svc.faq || []).map((f: any) => ({
      questionEn: f.questionEn || f.question || '',
      questionFa: f.questionFa || f.question || '',
      answerEn: f.answerEn || f.answer || '',
      answerFa: f.answerFa || f.answer || '',
    })));
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    const trimInput = (value?: string | null) => (typeof value === 'string' ? value.trim() : '');
    const prefer = (...values: Array<string | null | undefined>) => {
      for (const value of values) {
        const trimmed = trimInput(value);
        if (trimmed) return trimmed;
      }
      return '';
    };

    const benefitsPayload = benefits
      .map((b) => {
        const textEn = trimInput(b.textEn);
        const textFa = trimInput(b.textFa);
        const text = prefer(textEn, textFa);
        if (!text) return null;
        return { text, textEn: textEn || undefined, textFa: textFa || undefined };
      })
      .filter((item): item is { text: string; textEn?: string; textFa?: string } => Boolean(item));

    const stepsPayload = steps
      .map((s, idx) => {
        const descriptionEn = trimInput(s.descriptionEn);
        const descriptionFa = trimInput(s.descriptionFa);
        const description = prefer(descriptionEn, descriptionFa);
        if (!description) return null;
        return {
          stepNumber: s.stepNumber ?? idx + 1,
          title: trimInput(s.title) || undefined,
          description,
          descriptionEn: descriptionEn || undefined,
          descriptionFa: descriptionFa || undefined,
        };
      })
      .filter((item): item is { stepNumber: number; title?: string; description: string; descriptionEn?: string; descriptionFa?: string } => Boolean(item));

    const faqPayload = faqs
      .map((f) => {
        const questionEn = trimInput(f.questionEn);
        const questionFa = trimInput(f.questionFa);
        const answerEn = trimInput(f.answerEn);
        const answerFa = trimInput(f.answerFa);
        const question = prefer(questionEn, questionFa);
        const answer = prefer(answerEn, answerFa);
        if (!question || !answer) return null;
        return {
          question,
          questionEn: questionEn || undefined,
          questionFa: questionFa || undefined,
          answer,
          answerEn: answerEn || undefined,
          answerFa: answerFa || undefined,
        };
      })
      .filter((item): item is { question: string; questionEn?: string; questionFa?: string; answer: string; answerEn?: string; answerFa?: string } => Boolean(item));

    const rawDurationMinutes = trimInput(form.durationMinutes);
    const durationMinutesValue = rawDurationMinutes && Number.isFinite(Number(rawDurationMinutes)) ? Number(rawDurationMinutes) : undefined;

    const payload = {
      title: prefer(form.titleEn, form.titleFa),
      titleEn: trimInput(form.titleEn) || undefined,
      titleFa: trimInput(form.titleFa) || undefined,
      subtitle: prefer(form.subtitleEn, form.subtitleFa) || undefined,
      subtitleEn: trimInput(form.subtitleEn) || undefined,
      subtitleFa: trimInput(form.subtitleFa) || undefined,
      slug: trimInput(form.slug),
      description: prefer(form.descriptionEn, form.descriptionFa),
      descriptionEn: trimInput(form.descriptionEn) || undefined,
      descriptionFa: trimInput(form.descriptionFa) || undefined,
      image: trimInput(form.image) || undefined,
      priceRange: prefer(form.priceRangeEn, form.priceRangeFa) || undefined,
      priceRangeEn: trimInput(form.priceRangeEn) || undefined,
      priceRangeFa: trimInput(form.priceRangeFa) || undefined,
      duration: prefer(form.durationEn, form.durationFa) || undefined,
      durationEn: trimInput(form.durationEn) || undefined,
      durationFa: trimInput(form.durationFa) || undefined,
      durationMinutes: durationMinutesValue,
      recovery: prefer(form.recoveryEn, form.recoveryFa) || undefined,
      recoveryEn: trimInput(form.recoveryEn) || undefined,
      recoveryFa: trimInput(form.recoveryFa) || undefined,
      benefits: benefitsPayload,
      processSteps: stepsPayload,
      faq: faqPayload,
    };

    if ((!payload.titleEn && !payload.titleFa) || !payload.slug || (!payload.descriptionEn && !payload.descriptionFa)) {
      toast.error(t('admin.requiredFieldsMissing'));
      return;
    }

    try {
      if (editingService) {
        await apiFetch(`/services/${editingService.id}`, { method: 'PUT', body: payload });
        toast.success(t('admin.serviceUpdated'));
      } else {
        await apiFetch('/services', { method: 'POST', body: payload });
        toast.success(t('admin.serviceCreated'));
      }
      setIsDialogOpen(false);
      setEditingService(null);
      await fetchServices();
    } catch (e: any) {
      if (e?.code === 'slug_conflict') toast.error(t('admin.slugConflict'));
      else toast.error(e?.message || t('admin.saveFailed'));
    }
  };

  const handleDelete = async (svc: Service) => {
  if (!confirm(`${t('admin.deleteServiceConfirm')} "${svc.title}"?`)) return;
    try {
      await apiFetch(`/services/${svc.id}`, { method: 'DELETE' });
  toast.success(t('admin.serviceDeleted'));
      setServices(prev => prev.filter(s => s.id !== svc.id));
    } catch (e: any) {
  toast.error(e?.message || t('admin.deleteFailed'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-gray-900">{t('admin.servicesContent')}</h1>
          <p className="text-gray-600">{t('admin.servicesContentSubtitle')}</p>
        </div>
        <Button
          onClick={openAddDialog}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('admin.addService')}
        </Button>
      </div>

      {/* Hero Content Section */}
      <Card className="p-6 border-0 shadow-lg">
        <h3 className="mb-4 text-gray-900 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-pink-600" />
          {t('admin.servicesHero')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="hero-title-en" className="text-xs uppercase tracking-wide text-gray-500">{t('admin.heroTitleEn')}</Label>
            <Input
              id="hero-title-en"
              value={heroContent.servicesHeroTitleEn || ''}
              onChange={(e) => setHeroContent({ ...heroContent, servicesHeroTitleEn: e.target.value })}
              className="mt-1 rounded-xl"
              placeholder="Our Services"
            />
          </div>
          <div>
            <Label htmlFor="hero-title-fa" className="text-xs uppercase tracking-wide text-gray-500">{t('admin.heroTitleFa')}</Label>
            <Input
              id="hero-title-fa"
              dir="rtl"
              className="mt-1 rounded-xl text-right"
              value={heroContent.servicesHeroTitleFa || ''}
              onChange={(e) => setHeroContent({ ...heroContent, servicesHeroTitleFa: e.target.value })}
              placeholder="خدمات ما"
            />
          </div>
          <div>
            <Label htmlFor="hero-subtitle-en" className="text-xs uppercase tracking-wide text-gray-500">{t('admin.heroSubtitleEn')}</Label>
            <Textarea
              id="hero-subtitle-en"
              rows={3}
              value={heroContent.servicesHeroSubtitleEn || ''}
              onChange={(e) => setHeroContent({ ...heroContent, servicesHeroSubtitleEn: e.target.value })}
              className="mt-1 rounded-xl"
              placeholder="Professional beauty treatments..."
            />
          </div>
          <div>
            <Label htmlFor="hero-subtitle-fa" className="text-xs uppercase tracking-wide text-gray-500">{t('admin.heroSubtitleFa')}</Label>
            <Textarea
              id="hero-subtitle-fa"
              dir="rtl"
              rows={3}
              className="mt-1 rounded-xl text-right"
              value={heroContent.servicesHeroSubtitleFa || ''}
              onChange={(e) => setHeroContent({ ...heroContent, servicesHeroSubtitleFa: e.target.value })}
              placeholder="درمان‌های تخصصی زیبایی..."
            />
          </div>
        </div>
        <Button
          disabled={heroSaving}
          onClick={saveHeroContent}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
        >
          {heroSaving ? t('admin.saving') : t('admin.saveHeroContent')}
        </Button>
      </Card>

      {/* Services List Header */}
      <div className="flex items-center justify-between pt-4">
        <h2 className="text-xl font-semibold text-gray-900">{t('admin.servicesList')}</h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: t('admin.totalServices'), value: services.length, color: 'from-pink-500 to-rose-600' },
          { label: t('admin.withPriceRange'), value: services.filter((s) => !!s.priceRange).length, color: 'from-purple-500 to-violet-600' },
          { label: t('admin.withDuration'), value: services.filter((s) => !!s.duration).length, color: 'from-blue-500 to-cyan-600' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4 border-0 shadow-lg">
              <p className="text-gray-600 mb-2">{stat.label}</p>
              <div className={`bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.value}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Services Grid */}
      {loading && (
  <div className="p-6 text-gray-500">{t('admin.loadingServices')}</div>
      )}
      {error && (
        <div className="p-6 text-red-600">{error}</div>
      )}
      {!loading && !error && (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="mb-1 text-gray-900">{service.title}</h3>
                  {service.subtitle && <p className="text-gray-500 mb-1">{service.subtitle}</p>}
                  <p className="text-gray-600 mb-4 line-clamp-3">{service.description}</p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign className="w-4 h-4 text-pink-500" />
                    <span>{t('admin.priceRange')}</span>
                  </div>
                  <span className="text-gray-900">{service.priceRange || '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <span>{t('admin.duration')}</span>
                  </div>
                  <span className="text-gray-900">{service.duration || '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Briefcase className="w-4 h-4 text-blue-500" />
                    <span>{t('admin.recovery')}</span>
                  </div>
                  <span className="text-gray-900">{service.recovery || '-'}</span>
                </div>
              </div>
              <Badge className="bg-gray-100 text-gray-700">Slug: {service.slug}</Badge>

              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-xl"
                  onClick={() => openEditDialog(service)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {t('admin.edit')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-xl text-red-600 hover:bg-red-50"
                  onClick={() => handleDelete(service)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t('admin.delete')}
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
      )}

      {/* Add/Edit Service Dialog */}
  <Dialog open={isDialogOpen} onOpenChange={(open: boolean) => {
        if (!open) {
          setIsDialogOpen(false);
          setEditingService(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingService ? t('admin.editService') : t('admin.addNewService')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Titles */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="service-name-en">{t('admin.serviceNameLabel')} (EN)</Label>
                <Input
                  id="service-name-en"
                  placeholder="e.g., Hair Implant"
                  value={form.titleEn || ''}
                  onChange={(e) => setForm((f: any) => ({ ...f, titleEn: e.target.value }))}
                  className="mt-2 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="service-name-fa">{t('admin.serviceNameLabel')} (FA)</Label>
                <Input
                  id="service-name-fa"
                  placeholder="مثلاً کاشت مو"
                  dir="rtl"
                  className="mt-2 rounded-xl text-right"
                  value={form.titleFa || ''}
                  onChange={(e) => setForm((f: any) => ({ ...f, titleFa: e.target.value }))}
                />
              </div>
            </div>
            {/* Subtitles */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="service-subtitle-en">{t('admin.subtitleLabel')} (EN)</Label>
                <Input
                  id="service-subtitle-en"
                  placeholder="Short subheading"
                  value={form.subtitleEn || ''}
                  onChange={(e) => setForm((f: any) => ({ ...f, subtitleEn: e.target.value }))}
                  className="mt-2 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="service-subtitle-fa">{t('admin.subtitleLabel')} (FA)</Label>
                <Input
                  id="service-subtitle-fa"
                  placeholder="زیرعنوان کوتاه"
                  dir="rtl"
                  className="mt-2 rounded-xl text-right"
                  value={form.subtitleFa || ''}
                  onChange={(e) => setForm((f: any) => ({ ...f, subtitleFa: e.target.value }))}
                />
              </div>
            </div>
            {/* Descriptions */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="service-desc-en">{t('admin.descriptionLabel')} (EN)</Label>
                <Textarea
                  id="service-desc-en"
                  placeholder="Describe the service..."
                  value={form.descriptionEn || ''}
                  onChange={(e) => setForm((f: any) => ({ ...f, descriptionEn: e.target.value }))}
                  className="mt-2 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="service-desc-fa">{t('admin.descriptionLabel')} (FA)</Label>
                <Textarea
                  id="service-desc-fa"
                  placeholder="توضیح خدمت..."
                  dir="rtl"
                  className="mt-2 rounded-xl text-right"
                  value={form.descriptionFa || ''}
                  onChange={(e) => setForm((f: any) => ({ ...f, descriptionFa: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="service-slug">{t('admin.slugLabel')}</Label>
              <Input
                id="service-slug"
                placeholder="hair-implant"
                value={form.slug || ''}
                onChange={(e) => setForm(f => ({ ...f, slug: e.target.value.replace(/\s+/g, '-').toLowerCase() }))}
                className="mt-2 rounded-xl"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="service-price-en">{t('admin.startingPriceLabel')} (EN)</Label>
                <Input
                  id="service-price-en"
                  placeholder="$0"
                  value={form.priceRangeEn || ''}
                  onChange={(e) => setForm(f => ({ ...f, priceRangeEn: e.target.value }))}
                  className="mt-2 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="service-price-fa">{t('admin.startingPriceLabel')} (FA)</Label>
                <Input
                  id="service-price-fa"
                  placeholder="مثلاً ۵ میلیون"
                  dir="rtl"
                  className="mt-2 rounded-xl text-right"
                  value={form.priceRangeFa || ''}
                  onChange={(e) => setForm(f => ({ ...f, priceRangeFa: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="service-duration-en">{t('admin.durationLabel')} (EN)</Label>
                <Input
                  id="service-duration-en"
                  placeholder="e.g., 2-4 hours"
                  value={form.durationEn || ''}
                  onChange={(e) => setForm(f => ({ ...f, durationEn: e.target.value }))}
                  className="mt-2 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="service-duration-fa">{t('admin.durationLabel')} (FA)</Label>
                <Input
                  id="service-duration-fa"
                  placeholder="مثلاً ۲ تا ۴ ساعت"
                  dir="rtl"
                  className="mt-2 rounded-xl text-right"
                  value={form.durationFa || ''}
                  onChange={(e) => setForm(f => ({ ...f, durationFa: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="service-duration-minutes">{t('admin.durationLabel')} (minutes)</Label>
                <Input
                  id="service-duration-minutes"
                  type="number"
                  min="0"
                  placeholder="120"
                  value={form.durationMinutes || ''}
                  onChange={(e) => setForm(f => ({ ...f, durationMinutes: e.target.value }))}
                  className="mt-2 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="service-recovery-en">{t('admin.recoveryTimeLabel')} (EN)</Label>
                <Input
                  id="service-recovery-en"
                  placeholder="e.g., 5-7 days"
                  value={form.recoveryEn || ''}
                  onChange={(e) => setForm(f => ({ ...f, recoveryEn: e.target.value }))}
                  className="mt-2 rounded-xl"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="service-recovery-fa">{t('admin.recoveryTimeLabel')} (FA)</Label>
              <Input
                id="service-recovery-fa"
                placeholder="مثلاً ۵ تا ۷ روز"
                dir="rtl"
                className="mt-2 rounded-xl text-right"
                value={form.recoveryFa || ''}
                onChange={(e) => setForm(f => ({ ...f, recoveryFa: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="service-image">{t('admin.imageUrlLabel')}</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                <div className="flex-1 min-w-[220px] flex items-center gap-2 rounded-xl border bg-white px-3 py-2">
                  <ImageIcon className="w-4 h-4 text-gray-400" />
                  <Input
                    id="service-image"
                    placeholder="https://..."
                    value={form.image || ''}
                    onChange={(e) => setForm(f => ({ ...f, image: e.target.value }))}
                    className="border-0 focus-visible:ring-0 px-0"
                  />
                </div>
                <label className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium cursor-pointer ${imageUploading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-50'}`}>
                  <UploadCloud className="w-4 h-4" />
                  {imageUploading ? t('admin.media.uploading') : t('admin.media.uploadImage')}
                  <input type="file" accept="image/*" className="sr-only" onChange={handleImageFileChange} disabled={imageUploading} />
                </label>
              </div>
              {form.image && (
                <img src={resolveMediaUrl(form.image)} alt="preview" className="mt-3 h-24 w-full object-cover rounded-xl border" />
              )}
            </div>
            {/* Nested Editors */}
            <div className="pt-4 border-t border-gray-200 space-y-6">
              <div>
                <Label>{t('admin.benefitsLabel')}</Label>
                <div className="mt-2 space-y-2">
                  {benefits.map((b, idx) => (
                    <div key={idx} className="rounded-xl bg-gray-50 p-3 space-y-2">
                      <Input
                        value={b.textEn}
                        onChange={(e) => setBenefits(arr => arr.map((x,i)=> i===idx? { ...x, textEn: e.target.value }: x))}
                        placeholder={`${t('admin.benefitPlaceholder')} (EN)`}
                        className="rounded-xl"
                      />
                      <Input
                        value={b.textFa}
                        dir="rtl"
                        onChange={(e) => setBenefits(arr => arr.map((x,i)=> i===idx? { ...x, textFa: e.target.value }: x))}
                        placeholder={`${t('admin.benefitPlaceholder')} (FA)`}
                        className="rounded-xl text-right"
                      />
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm" className="rounded-xl text-red-600 hover:bg-red-50" onClick={() => setBenefits(arr => arr.filter((_,i)=>i!==idx))}>{t('admin.remove')}</Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setBenefits(arr => [...arr,{ textEn: '', textFa: '' }])}>{t('admin.addBenefit')}</Button>
                </div>
              </div>
              <div>
                <Label>{t('admin.processStepsLabel')}</Label>
                <div className="mt-2 space-y-3">
                  {steps.map((s, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-gray-50 space-y-2">
                      <div className="grid md:grid-cols-5 gap-2">
                        <Input
                          type="number"
                          value={s.stepNumber ?? idx + 1}
                          onChange={(e) => setSteps(arr => arr.map((x,i)=> i===idx? { ...x, stepNumber: parseInt(e.target.value)||idx+1 }: x))}
                          className="md:col-span-1 rounded-xl"
                          placeholder="#"
                        />
                        <Input
                          value={s.title || ''}
                          onChange={(e) => setSteps(arr => arr.map((x,i)=> i===idx? { ...x, title: e.target.value }: x))}
                          className="md:col-span-2 rounded-xl"
                          placeholder={t('admin.subtitleLabel')}
                        />
                        <Textarea
                          value={s.descriptionEn}
                          onChange={(e) => setSteps(arr => arr.map((x,i)=> i===idx? { ...x, descriptionEn: e.target.value }: x))}
                          className="md:col-span-2 rounded-xl"
                          placeholder={`${t('admin.descriptionLabel')} (EN)`}
                        />
                        <Textarea
                          value={s.descriptionFa}
                          dir="rtl"
                          onChange={(e) => setSteps(arr => arr.map((x,i)=> i===idx? { ...x, descriptionFa: e.target.value }: x))}
                          className="md:col-span-2 rounded-xl text-right"
                          placeholder={`${t('admin.descriptionLabel')} (FA)`}
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm" className="rounded-xl text-red-600 hover:bg-red-50" onClick={() => setSteps(arr => arr.filter((_,i)=>i!==idx))}>{t('admin.remove')}</Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setSteps(arr => [...arr,{ descriptionEn: '', descriptionFa: '' }])}>{t('admin.addStep')}</Button>
                </div>
              </div>
              <div>
                <Label>{t('admin.faqLabel')}</Label>
                <div className="mt-2 space-y-3">
                  {faqs.map((f, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-gray-50 space-y-2">
                      <Input
                        value={f.questionEn}
                        onChange={(e) => setFaqs(arr => arr.map((x,i)=> i===idx? { ...x, questionEn: e.target.value }: x))}
                        placeholder={`${t('admin.questionPlaceholder')} (EN)`}
                        className="rounded-xl"
                      />
                      <Input
                        value={f.questionFa}
                        dir="rtl"
                        onChange={(e) => setFaqs(arr => arr.map((x,i)=> i===idx? { ...x, questionFa: e.target.value }: x))}
                        placeholder={`${t('admin.questionPlaceholder')} (FA)`}
                        className="rounded-xl text-right"
                      />
                      <Textarea
                        value={f.answerEn}
                        onChange={(e) => setFaqs(arr => arr.map((x,i)=> i===idx? { ...x, answerEn: e.target.value }: x))}
                        placeholder={`${t('admin.answerPlaceholder')} (EN)`}
                        className="rounded-xl"
                      />
                      <Textarea
                        value={f.answerFa}
                        dir="rtl"
                        onChange={(e) => setFaqs(arr => arr.map((x,i)=> i===idx? { ...x, answerFa: e.target.value }: x))}
                        placeholder={`${t('admin.answerPlaceholder')} (FA)`}
                        className="rounded-xl text-right"
                      />
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm" className="rounded-xl text-red-600 hover:bg-red-50" onClick={() => setFaqs(arr => arr.filter((_,i)=>i!==idx))}>{t('admin.remove')}</Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setFaqs(arr => [...arr,{ questionEn: '', questionFa: '', answerEn: '', answerFa: '' }])}>{t('admin.addFaq')}</Button>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setEditingService(null);
              }}
            >
              {t('admin.cancel')}
            </Button>
            <Button
              className="bg-gradient-to-r from-pink-500 to-purple-600"
              onClick={handleSave}
            >
              {editingService ? t('admin.update') : t('admin.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
