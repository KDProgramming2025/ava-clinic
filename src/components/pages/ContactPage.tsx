import { useEffect, useMemo, useState, type ComponentType } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Facebook, Instagram, Twitter, Youtube, Globe } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { api, apiFetch } from '../../api/client';
import { SEO } from '../SEO';
import { resolveMediaUrl } from '../../utils/media';

interface ContactInfoValue { id?: string; value?: string | null; valueEn?: string | null; valueFa?: string | null }
interface ContactInfoBlock {
  id?: string;
  type?: string;
  title?: string | null;
  titleEn?: string | null;
  titleFa?: string | null;
  values?: ContactInfoValue[];
}
interface ContactFaq {
  id?: string;
  question?: string | null;
  questionEn?: string | null;
  questionFa?: string | null;
  answer?: string | null;
  answerEn?: string | null;
  answerFa?: string | null;
}
interface SocialLink {
  id?: string;
  platform?: string | null;
  platformEn?: string | null;
  platformFa?: string | null;
  url?: string | null;
  icon?: string | null;
}
interface QuickAction {
  id?: string;
  label?: string | null;
  labelEn?: string | null;
  labelFa?: string | null;
  type?: string | null;
  target?: string | null;
}
interface ContactMapConfig {
  latitude?: number | null;
  longitude?: number | null;
  zoom?: number | null;
  markerLabel?: string | null;
}

export function ContactPage() {
  const { t, isRTL, trc, language } = useLanguage();

  // Data state
  const [blocks, setBlocks] = useState<ContactInfoBlock[]>([]);
  const [faq, setFaq] = useState<ContactFaq[]>([]);
  const [social, setSocial] = useState<SocialLink[]>([]);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [mapConfig, setMapConfig] = useState<ContactMapConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pickLocalized = (fa?: string | null, en?: string | null, fallback?: string | null) => {
    const order = language === 'fa' ? [fa, en, fallback] : [en, fa, fallback];
    for (const value of order) {
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed.length) return trimmed;
      }
    }
    return typeof fallback === 'string' ? fallback.trim() : '';
  };

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await api.contact();
        if (cancelled) return;
        const normalizedBlocks = (data.blocks || []).map((b: any) => ({
          ...b,
          values: (b.values || []).map((v: any) => typeof v === 'string' ? { value: v } : ({
            id: v?.id,
            value: v?.value ?? '',
            valueEn: v?.valueEn ?? v?.value ?? '',
            valueFa: v?.valueFa ?? v?.value ?? '',
          })),
        }));
        setBlocks(normalizedBlocks);
        setFaq(Array.isArray(data.faq) ? data.faq : []);
        setSocial(Array.isArray(data.social) ? data.social : []);
        setQuickActions(Array.isArray(data.quickActions) ? data.quickActions : []);
        setMapConfig(data.map || null);
      } catch (e: any) {
        if (!cancelled) setError(e.message || t('contact.loadFailed'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const iconForBlock = (type?: string) => {
    switch (String(type || '').toLowerCase()) {
      case 'phone': return Phone;
      case 'email': return Mail;
      case 'address': return MapPin;
      case 'hours': return Clock;
      default: return Globe;
    }
  };
  const colorForBlock = (type?: string) => {
    switch (String(type || '').toLowerCase()) {
      case 'phone': return 'from-pink-500 to-rose-500';
      case 'email': return 'from-purple-500 to-pink-500';
      case 'address': return 'from-blue-500 to-purple-500';
      case 'hours': return 'from-green-500 to-blue-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };
  const iconForSocial = (platform?: string) => {
    switch ((platform || '').toLowerCase()) {
      case 'facebook': return Facebook;
      case 'instagram': return Instagram;
      case 'twitter': return Twitter;
      case 'youtube': return Youtube;
      default: return Globe;
    }
  };
  const hrefForQuickAction = (qa: QuickAction) => {
    switch ((qa.type || '').toLowerCase()) {
      case 'call': return `tel:${qa.target}`;
      case 'email': return `mailto:${qa.target}`;
      case 'chat': return qa.target || '#';
      default: return qa.target || '#';
    }
  };
  const iconForQuickAction = (qa: QuickAction) => {
    switch ((qa.type || '').toLowerCase()) {
      case 'call': return Phone;
      case 'email': return Mail;
      case 'chat': return MessageSquare;
      default: return Send;
    }
  };

  const dynamicLucideIcon = (name?: string | null) => {
    if (!name) return null;
    return (LucideIcons as Record<string, ComponentType<{ className?: string }>>)[name] || null;
  };

  const renderSocialIcon = (iconValue?: string | null, platform?: string | null, label?: string) => {
    const trimmed = iconValue?.trim();
    if (trimmed) {
      if (trimmed.startsWith('lucide:')) {
        const iconName = trimmed.replace('lucide:', '');
        const IconComponent = dynamicLucideIcon(iconName);
        if (IconComponent) return <IconComponent className="w-7 h-7" aria-hidden="true" />;
      }
      if (/^data:/i.test(trimmed) || trimmed.startsWith('/') || /^https?:/i.test(trimmed)) {
        return (
          <img
            src={resolveMediaUrl(trimmed)}
            alt={label || platform || 'social link'}
            className="w-7 h-7 object-contain"
            loading="lazy"
          />
        );
      }
      const IconComponent = dynamicLucideIcon(trimmed);
      if (IconComponent) return <IconComponent className="w-7 h-7" aria-hidden="true" />;
    }
    const Icon = iconForSocial(platform);
    return <Icon className="w-7 h-7" aria-hidden="true" />;
  };

  const hasMapCoordinates = Number.isFinite(mapConfig?.latitude as number) && Number.isFinite(mapConfig?.longitude as number);
  const mapEmbedUrl = hasMapCoordinates
    ? `https://www.google.com/maps?q=${mapConfig?.latitude},${mapConfig?.longitude}&z=${mapConfig?.zoom || 15}&output=embed`
    : null;
  const mapLink = hasMapCoordinates ? `https://maps.google.com/?q=${mapConfig?.latitude},${mapConfig?.longitude}` : null;
  const addressBlock = blocks.find((b) => (b.type || '').toLowerCase() === 'address');
  const primaryAddress = addressBlock?.values?.[0];
  const addressText = primaryAddress ? pickLocalized(primaryAddress.valueFa, primaryAddress.valueEn, primaryAddress.value) : '';

  const primaryActionIndex = useMemo(() => quickActions.findIndex((q) => (q.type || '').toLowerCase() === 'call'), [quickActions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast.error(t('contact.form.phoneRequired'));
      return;
    }
    try {
      setSubmitting(true);
      await apiFetch('/messages', { body: { fromName: name, email, phone, subject, body: message } });
      toast.success(t('contact.form.sentSuccess'));
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      toast.error(err?.message || t('contact.form.sentFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.example.com';
  const canonical = `${origin}/contact`;
  // Hreflang alternates assumption: site supports fa (default) and en.
  const alternates = [
    { hrefLang: 'fa', href: `${origin}/contact` },
    { hrefLang: 'en', href: `${origin}/contact?lang=en` }
  ];
  return (
    <div className="pt-20 min-h-screen">
      <SEO
        title={t('contact')}
        description={t('contact.subtitle')}
        canonical={canonical}
        alternates={alternates}
        image="/og-image.jpg"
        type="website"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: t('home'), item: origin + '/' },
            { '@type': 'ListItem', position: 2, name: t('contact'), item: canonical }
          ]
        }}
      />
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              {t('contact')}
            </h1>
            <p className="text-gray-700 max-w-3xl mx-auto">
              {t('contact.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 -mt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {error && <div className="col-span-4 text-center py-8 text-red-600">{error}</div>}
            {(blocks.length
              ? blocks
              : loading
                ? Array.from({ length: 4 }).map(
                    () => ({ type: '', title: '', values: [{ value: '' }, { value: '' }] })
                  ) as ContactInfoBlock[]
                : []
            ).map((info: ContactInfoBlock, index) => {
              const blockTitle = pickLocalized(info?.titleFa, info?.titleEn, info?.title);
              return (
                <motion.div
                  key={info.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="p-6 border-0 shadow-xl text-center bg-white h-full">
                    <div className={`w-14 h-14 bg-gradient-to-br ${colorForBlock(info.type)} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                      {loading ? (
                        <div className="w-7 h-7 bg-white/40 rounded animate-pulse" />
                      ) : (
                        (() => { const Icon = iconForBlock(info.type); return <Icon className="w-7 h-7 text-white" />; })()
                      )}
                    </div>
                    <h3 className="mb-3 text-gray-900">
                      {loading ? (
                        <div className="h-5 w-1/2 mx-auto bg-gray-200 rounded animate-pulse" />
                      ) : (
                        blockTitle
                      )}
                    </h3>
                    {(info.values || []).map((detail, i: number) => {
                      const detailText = typeof detail === 'string'
                        ? detail
                        : pickLocalized(detail?.valueFa, detail?.valueEn, detail?.value);
                      return (
                        <p key={(detail as any)?.id || i} className="text-gray-600">
                          {loading ? (
                            <span className="block h-4 w-3/4 mx-auto bg-gray-200 rounded animate-pulse" />
                          ) : (
                            detailText
                          )}
                        </p>
                      );
                    })}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 border-0 shadow-xl bg-gradient-to-br from-white to-pink-50/30">
                <div className="flex items-center gap-3 mb-6">
                  <MessageSquare className="w-6 h-6 text-pink-500" />
                  <h2 className="text-gray-900">{t('send')}</h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">{t('name')}*</Label>
                      <Input id="name" placeholder={t('contact.form.namePlaceholder')} required className="mt-2 rounded-xl" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="email">{t('email')}</Label>
                      <Input id="email" type="email" placeholder={t('contact.form.emailPlaceholder')} className="mt-2 rounded-xl" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">{t('phone')}*</Label>
                    <Input id="phone" type="tel" placeholder={t('contact.form.phonePlaceholder')} required className="mt-2 rounded-xl" value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>

                  <div>
                    <Label htmlFor="subject">{t('contact.form.subjectLabel')}*</Label>
                    <Input id="subject" placeholder={t('contact.form.subjectPlaceholder')} required className="mt-2 rounded-xl" value={subject} onChange={e => setSubject(e.target.value)} />
                  </div>

                  <div>
                    <Label htmlFor="message">{t('message')}*</Label>
                    <Textarea id="message" placeholder={t('contact.form.messagePlaceholder')} required className="mt-2 rounded-xl min-h-[150px]" value={message} onChange={e => setMessage(e.target.value)} />
                  </div>

                  <Button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl shadow-lg">
                    <Send className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {submitting ? t('contact.form.sending') : t('send')}
                  </Button>
                </form>
              </Card>
            </motion.div>

            {/* Map & Social */}
            <motion.div
              initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {/* Map */}
              <Card className="overflow-hidden border-0 shadow-xl">
                {mapEmbedUrl ? (
                  <div className="relative h-80">
                    <iframe
                      title={mapConfig?.markerLabel || 'Clinic Map'}
                      src={mapEmbedUrl}
                      width="100%"
                      height="100%"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="absolute inset-0 w-full h-full border-0"
                    />
                    <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur rounded-2xl p-4 shadow-lg flex items-center justify-between gap-4">
                      <div>
                        <p className="text-gray-900 font-semibold">{mapConfig?.markerLabel || t('contact')}</p>
                        <p className="text-gray-600 text-sm">{addressText || t('contact.map.addressPlaceholder')}</p>
                      </div>
                      {mapLink && (
                        <Button asChild variant="outline" className="rounded-xl">
                          <a href={mapLink} target="_blank" rel="noreferrer" className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {t('contact.map.title')}
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-80 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-16 h-16 text-pink-500 mx-auto mb-4" />
                      <p className="text-gray-600">{t('contact.map.title')}</p>
                      <p className="text-gray-500 mt-2">{t('contact.map.addressPlaceholder')}</p>
                    </div>
                  </div>
                )}
              </Card>

              {/* Social Media */}
              <Card className="p-8 border-0 shadow-xl bg-gradient-to-br from-pink-500 via-purple-600 to-blue-600 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16" />
                
                <div className="relative z-10">
                  <h3 className="mb-3 text-white">{t('followUs')}</h3>
                  <p className="text-white/90 mb-6">
                    {t('contact.social.subtitle')}
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    {social.map((s, index) => {
                      const platformLabel = pickLocalized(s.platformFa, s.platformEn, s.platform);
                      return (
                        <motion.a
                          key={s.id || index}
                          href={s.url || '#'}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          whileHover={{ scale: 1.1 }}
                          className="w-14 h-14 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center transition-all"
                          aria-label={platformLabel}
                        >
                          {renderSocialIcon(s.icon, s.platform, platformLabel)}
                        </motion.a>
                      );
                    })}
                  </div>
                </div>
              </Card>

              {/* Quick Links */}
              <Card className="p-6 border-0 shadow-xl">
                <h3 className="mb-4 text-gray-900">{t('contact.quickActions.title')}</h3>
                <div className="space-y-3">
                  {quickActions.map((qa, idx) => {
                    const Icon = iconForQuickAction(qa);
                    const href = hrefForQuickAction(qa);
                    const primary = idx === (primaryActionIndex >= 0 ? primaryActionIndex : 0);
                    const className = primary ? 'w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl justify-start' : 'w-full rounded-xl justify-start border-2';
                    const variant = primary ? undefined : 'outline';
                    const labelText = pickLocalized(qa.labelFa, qa.labelEn, qa.label);
                    return (
                      <a key={idx} href={href} target={qa.type === 'custom' || qa.type === 'chat' ? '_blank' : undefined} rel="noreferrer">
                        <Button variant={variant as any} className={className} asChild={false}>
                          <span className="flex items-center">
                            <Icon className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                            {loading ? (
                              <span className="block h-4 w-20 bg-gray-200 rounded animate-pulse" />
                            ) : (
                              labelText
                            )}
                          </span>
                        </Button>
                      </a>
                    );
                  })}
                  {quickActions.length === 0 && !loading && (
                    <p className="text-gray-600">{t('contact.quickActions.empty')}</p>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="mb-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              {t('contact.faqs.title')}
            </h2>
            <p className="text-gray-600">
              {t('contact.faqs.subtitle')}
            </p>
          </motion.div>

          <div className="space-y-4">
            {(faq.length
              ? faq
              : loading
                ? Array.from({ length: 3 }).map(() => ({ question: '', answer: '' })) as ContactFaq[]
                : []
            ).map((item: ContactFaq, index) => {
              const question = pickLocalized(item.questionFa, item.questionEn, item.question);
              const answer = pickLocalized(item.answerFa, item.answerEn, item.answer);
              return (
                <motion.div
                  key={item.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all">
                    <h3 className="mb-3 text-gray-900">
                      {loading ? <div className="h-5 w-2/3 bg-gray-200 rounded animate-pulse" /> : question}
                    </h3>
                    <p className="text-gray-600">
                      {loading ? (
                        <>
                          <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2" />
                          <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
                        </>
                      ) : (
                        answer
                      )}
                    </p>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          
        </div>
      </section>
    </div>
  );
}
