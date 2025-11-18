import { useEffect, useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Award, Users, TrendingUp, Heart, Shield, Clock, Star } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useServices } from '../../contexts/ServicesContext';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { api } from '../../api/client';
import { resolveMediaUrl } from '../../utils/media';
import { SEO } from '../SEO';

interface HomeHero {
  title?: string;
  titleEn?: string | null;
  titleFa?: string | null;
  subtitle?: string;
  subtitleEn?: string | null;
  subtitleFa?: string | null;
  description?: string;
  descriptionEn?: string | null;
  descriptionFa?: string | null;
  ctaPrimaryLabel?: string;
  ctaPrimaryLabelEn?: string | null;
  ctaPrimaryLabelFa?: string | null;
  ctaSecondaryLabel?: string;
  ctaSecondaryLabelEn?: string | null;
  ctaSecondaryLabelFa?: string | null;
  imageUrl?: string | null;
}
interface HomeStat { label: string; labelEn?: string | null; labelFa?: string | null; value: number | string; icon?: string | null; id?: string; }
interface HomeFeature { title: string; titleEn?: string | null; titleFa?: string | null; description?: string; descriptionEn?: string | null; descriptionFa?: string | null; icon?: string | null; id?: string; }
interface HomeCTA {
  heading?: string;
  headingEn?: string | null;
  headingFa?: string | null;
  subheading?: string;
  subheadingEn?: string | null;
  subheadingFa?: string | null;
  buttonLabel?: string;
  buttonLabelEn?: string | null;
  buttonLabelFa?: string | null;
}
interface Testimonial { name: string; text: string; rating?: number; image?: string; nameEn?: string; nameFa?: string; textEn?: string; textFa?: string; }

export function HomePage() {
  const { t, isRTL, trc, language } = useLanguage();
  const { services: servicesData } = useServices();
  const [hero, setHero] = useState<HomeHero | null>(null);
  const [stats, setStats] = useState<HomeStat[]>([]);
  const [features, setFeatures] = useState<HomeFeature[]>([]);
  const [cta, setCTA] = useState<HomeCTA | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true); // used only for subtle skeletons now (no blocking spinner)
  const [error, setError] = useState<string | null>(null);

  const servicesPreview = useMemo(() => {
    return Array.isArray(servicesData) ? servicesData.slice(0, 3) : [];
  }, [servicesData]);

  const pickLocalized = (fa?: string | null, en?: string | null, fallback?: string | null) => {
    const order = language === 'fa' ? [fa, en, fallback] : [en, fa, fallback];
    for (const value of order) {
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed.length) return trimmed;
      }
    }
    return fallback || '';
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const home = await api.home();
        if (cancelled) return;
  setHero(home?.hero || null);
  setStats(Array.isArray(home?.stats) ? home!.stats : []);
  setFeatures(Array.isArray(home?.features) ? home!.features : []);
  setCTA(home?.cta || null);
  setTestimonials(Array.isArray(home?.testimonials) ? home!.testimonials : []);
      } catch (e: any) {
        if (!cancelled) setError(e.message || t('home.loadFailed'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const iconForStat = (icon?: string | null) => {
    switch (icon) {
      case 'award': return <Award className="w-8 h-8" />;
      case 'users': return <Users className="w-8 h-8" />;
      case 'trending': return <TrendingUp className="w-8 h-8" />;
      case 'heart': return <Heart className="w-8 h-8" />;
      default: return null;
    }
  };
  const iconForFeature = (icon?: string | null) => {
    switch (icon) {
      case 'shield': return <Shield className="w-7 h-7 text-white" />;
      case 'award': return <Award className="w-7 h-7 text-white" />;
      case 'heart': return <Heart className="w-7 h-7 text-white" />;
      case 'clock': return <Clock className="w-7 h-7 text-white" />;
      default: return null;
    }
  };

  const selectTestimonialName = (item: any) => language === 'fa' ? (item.nameFa || item.name) : (item.nameEn || item.name);
  const selectTestimonialText = (item: any) => language === 'fa' ? (item.textFa || item.text) : (item.textEn || item.text);
  const heroTitle = pickLocalized(hero?.titleFa, hero?.titleEn, hero?.title);
  const heroSubtitle = pickLocalized(hero?.subtitleFa, hero?.subtitleEn, hero?.subtitle);
  const heroDescription = pickLocalized(hero?.descriptionFa, hero?.descriptionEn, hero?.description);
  const heroCtaPrimary = pickLocalized(hero?.ctaPrimaryLabelFa, hero?.ctaPrimaryLabelEn, hero?.ctaPrimaryLabel);
  const heroCtaSecondary = pickLocalized(hero?.ctaSecondaryLabelFa, hero?.ctaSecondaryLabelEn, hero?.ctaSecondaryLabel);
  const heroImageUrl = resolveMediaUrl(hero?.imageUrl);
  const ctaHeading = pickLocalized(cta?.headingFa, cta?.headingEn, cta?.heading);
  const ctaSubheading = pickLocalized(cta?.subheadingFa, cta?.subheadingEn, cta?.subheading);
  const ctaButton = pickLocalized(cta?.buttonLabelFa, cta?.buttonLabelEn, cta?.buttonLabel);

  return (
    <div className="pt-20">
      {/* SEO Meta */}
      {(() => {
        const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.example.com';
        const canonical = `${origin}/`;
        const alternates = [
          { hrefLang: 'fa', href: `${origin}/` },
          { hrefLang: 'en', href: `${origin}/?lang=en` }
        ];
        return (
          <SEO
            title={t('home')}
            description={t('heroDescription')}
            canonical={canonical}
            alternates={alternates}
            image="/og-image.jpg"
            type="website"
          />
        );
      })()}
      {error && <div className="text-center py-32 text-red-600">{error}</div>}
      {/* Always render layout; replace content with graceful placeholders while loading */}
        <>
          {/* Hero Section */}
          <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
              <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-pink-300/30 to-purple-300/30 rounded-full blur-3xl" />
              <motion.div animate={{ scale: [1.2, 1, 1.2], rotate: [90, 0, 90] }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }} className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-purple-300/30 to-blue-300/30 rounded-full blur-3xl" />
            </div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <motion.div initial={{ opacity: 0, x: isRTL ? 50 : -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                  {heroTitle && !loading ? (
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-6 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                      {heroTitle}
                    </motion.h1>
                  ) : (
                    <div className="mb-6 h-12 rounded-md bg-gradient-to-r from-pink-200 to-purple-200 animate-pulse" />
                  )}
                  {heroSubtitle && !loading ? (
                    <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-6 text-gray-700">
                      {heroSubtitle}
                    </motion.h2>
                  ) : (
                    <div className="mb-6 h-10 rounded-md bg-gradient-to-r from-purple-200 to-blue-200 animate-pulse" />
                  )}
                  {heroDescription && !loading ? (
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-8 text-gray-600">
                      {heroDescription}
                    </motion.p>
                  ) : (
                    <div className="mb-8 h-20 space-y-4">
                      <div className="h-8 w-48 rounded-full bg-pink-200 animate-pulse" />
                      <div className="h-8 w-56 rounded-full bg-purple-200 animate-pulse" />
                    </div>
                  )}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex flex-wrap gap-4">
                    {heroCtaPrimary && !loading && (
                      <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-full px-8 shadow-lg hover:shadow-xl transition-all">{heroCtaPrimary}</Button>
                    )}
                    {heroCtaSecondary && !loading && (
                      <Button variant="outline" className="rounded-full px-8 border-2 hover:bg-white/50">{heroCtaSecondary}</Button>
                    )}
                  </motion.div>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: isRTL ? -50 : 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="relative">
                  <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} className="rounded-3xl overflow-hidden shadow-2xl bg-white p-3">
                    {heroImageUrl && !loading ? (
                      <ImageWithFallback src={heroImageUrl} alt={t('hero.homeAlt')} className="rounded-2xl w-full h-auto" />
                    ) : (
                      <div className="rounded-2xl w-full h-[360px] bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200" aria-label={t('hero.homeAlt')} />
                    )}
                  </motion.div>
                </motion.div>
              </div>
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
                {(Array.isArray(stats) ? stats : loading ? Array.from({length:4}).map((_,i)=>({label:'',value:'',icon:null,id:i})) : []).map((stat: any, index) => {
                  const statLabel = pickLocalized(stat.labelFa, stat.labelEn, stat.label);
                  return (
                    <motion.div key={index} whileHover={{ y: -5 }} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg">
                      <div className="w-8 h-8 mx-auto mb-3 text-pink-500">{!loading && iconForStat(stat.icon)}</div>
                      <div className="mb-1 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent min-h-6">{!loading && stat.value}</div>
                      <p className="text-gray-600 min-h-4">{!loading && statLabel as any}</p>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </section>
          {/* Features */}
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="mb-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">{t('whyChooseUs')}</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {(Array.isArray(features) ? features : loading ? Array.from({length:4}).map(()=>({title:'',description:''})) : []).map((feature: any, index) => {
                  const featureTitle = pickLocalized(feature.titleFa, feature.titleEn, feature.title);
                  const featureDescription = pickLocalized(feature.descriptionFa, feature.descriptionEn, feature.description);
                  return (
                    <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} whileHover={{ y: -10 }}>
                      <Card className="p-6 h-full border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-white to-pink-50/30">
                        <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">{!loading && iconForFeature(feature.icon)}</div>
                        <h3 className="mb-3 text-gray-900 min-h-6">{!loading && featureTitle as any}</h3>
                        <p className="text-gray-600 min-h-10">{!loading && featureDescription as any}</p>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
          {/* Services Preview */}
          <section className="py-20 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="mb-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">{t('ourServices')}</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {(Array.isArray(servicesPreview) && servicesPreview.length ? servicesPreview : loading ? Array.from({length:3}).map(()=>({id:0,title:'',subtitle:'',image:''})) : []).map((service: any, index) => {
                  const serviceKey = service.slug || service.id;
                  const localizedTitle = pickLocalized(service.titleFa, service.titleEn, service.title);
                  const subtitleFallback = service.subtitle || (service.description ? service.description.slice(0, 120) : '');
                  const localizedSubtitle = pickLocalized(service.subtitleFa, service.subtitleEn, subtitleFallback) || subtitleFallback;
                  return (
                    <motion.div key={service.id || index} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} whileHover={{ y: -10 }}>
                      <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all">
                        <div className="relative h-64 overflow-hidden">
                          {loading ? <div className="w-full h-full bg-gradient-to-br from-pink-200 to-purple-200 animate-pulse" /> : (
                            <ImageWithFallback src={service.image} alt={localizedTitle} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-white mb-2 min-h-6">{!loading && localizedTitle}</h3>
                          </div>
                        </div>
                        <div className="p-6">
                          <p className="text-gray-600 mb-4 min-h-10">{!loading && localizedSubtitle}</p>
                          {!loading && <Button variant="outline" className="w-full rounded-full border-pink-500 text-pink-600 hover:bg-pink-50">{t('learnMore')}</Button>}
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
          {/* Testimonials */}
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="mb-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">{t('testimonials')}</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {(Array.isArray(testimonials) && testimonials.length ? testimonials : loading ? Array.from({length:3}).map(()=>({name:'',text:'',rating:0,image:''})) : []).map((testimonial: any, index) => (
                  <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} whileHover={{ y: -5 }}>
                    <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-white to-purple-50/30">
                      <div className="flex gap-1 mb-4">
                        {!loading && [...Array(testimonial.rating || 0)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-gray-700 mb-6 italic min-h-12">{!loading && `"${selectTestimonialText(testimonial)}"`}</p>
                      <div className="flex items-center gap-3">
                        {loading ? <div className="w-12 h-12 rounded-full bg-pink-200 animate-pulse" /> : <ImageWithFallback src={testimonial.image} alt={selectTestimonialName(testimonial)} className="w-12 h-12 rounded-full object-cover" />}
                        <div>
                          <p className="text-gray-900 min-h-4">{!loading && selectTestimonialName(testimonial)}</p>
                          <p className="text-gray-500 min-h-4">{!loading && t('testimonials.verifiedClient')}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
          {/* CTA Section */}
          <section className="py-20 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h2 className="text-white mb-6 min-h-8">{!loading && (ctaHeading ? ctaHeading : t('services.ctaTitle'))}</h2>
                <p className="text-white/90 mb-8 max-w-2xl mx-auto min-h-10">{!loading && (ctaSubheading ? ctaSubheading : '')}</p>
                {!loading && ctaButton && (
                  <Button className="bg-white text-purple-600 hover:bg-gray-100 rounded-full px-8 shadow-xl">{ctaButton}</Button>
                )}
              </motion.div>
            </div>
          </section>
        </>
    </div>
  );
}
 
