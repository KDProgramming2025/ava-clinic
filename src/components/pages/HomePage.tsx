import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Award, Users, TrendingUp, Heart, Shield, Clock, Star } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { api } from '../../api/client';

interface HomeHero { title?: string; subtitle?: string; description?: string; ctaPrimaryLabel?: string; ctaSecondaryLabel?: string; }
interface HomeStat { label: string; value: number | string; icon?: string | null; }
interface HomeFeature { title: string; description?: string; icon?: string | null; }
interface HomeCTA { heading?: string; subheading?: string; buttonLabel?: string; }
interface Testimonial { name: string; text: string; rating?: number; image?: string; }

export function HomePage() {
  const { t, isRTL } = useLanguage();
  const [hero, setHero] = useState<HomeHero | null>(null);
  const [stats, setStats] = useState<HomeStat[]>([]);
  const [features, setFeatures] = useState<HomeFeature[]>([]);
  const [cta, setCTA] = useState<HomeCTA | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [servicesPreview, setServicesPreview] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [home, services] = await Promise.all([api.home(), api.services()]);
        if (cancelled) return;
        setHero(home.hero || null);
        setStats(home.stats || []);
        setFeatures(home.features || []);
        setCTA(home.cta || null);
        setTestimonials(home.testimonials || []);
        setServicesPreview((services || []).slice(0, 3));
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Failed to load');
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

  return (
    <div className="pt-20">
      {loading && <div className="text-center py-32">Loading...</div>}
      {error && !loading && <div className="text-center py-32 text-red-600">{error}</div>}
      {!loading && !error && (
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
                  {hero?.title && (
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-6 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                      {hero.title}
                    </motion.h1>
                  )}
                  {hero?.subtitle && (
                    <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-6 text-gray-700">
                      {hero.subtitle}
                    </motion.h2>
                  )}
                  {hero?.description && (
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-8 text-gray-600">
                      {hero.description}
                    </motion.p>
                  )}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex flex-wrap gap-4">
                    {hero?.ctaPrimaryLabel && (
                      <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-full px-8 shadow-lg hover:shadow-xl transition-all">{hero.ctaPrimaryLabel}</Button>
                    )}
                    {hero?.ctaSecondaryLabel && (
                      <Button variant="outline" className="rounded-full px-8 border-2 hover:bg-white/50">{hero.ctaSecondaryLabel}</Button>
                    )}
                  </motion.div>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: isRTL ? -50 : 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="relative">
                  <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} className="rounded-3xl overflow-hidden shadow-2xl bg-white p-3">
                    <ImageWithFallback src="https://images.unsplash.com/photo-1673378630655-6a0e8eba07b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800" alt="Beauty treatment" className="rounded-2xl w-full h-auto" />
                  </motion.div>
                </motion.div>
              </div>
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
                {stats.map((stat, index) => (
                  <motion.div key={index} whileHover={{ y: -5 }} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg">
                    <div className="w-8 h-8 mx-auto mb-3 text-pink-500">{iconForStat(stat.icon)}</div>
                    <div className="mb-1 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">{stat.value}</div>
                    <p className="text-gray-600">{stat.label}</p>
                  </motion.div>
                ))}
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
                {features.map((feature, index) => (
                  <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} whileHover={{ y: -10 }}>
                    <Card className="p-6 h-full border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-white to-pink-50/30">
                      <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">{iconForFeature(feature.icon)}</div>
                      <h3 className="mb-3 text-gray-900">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </Card>
                  </motion.div>
                ))}
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
                {servicesPreview.map((service, index) => (
                  <motion.div key={service.id || index} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} whileHover={{ y: -10 }}>
                    <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all">
                      <div className="relative h-64 overflow-hidden">
                        <ImageWithFallback src={service.image} alt={service.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-white mb-2">{service.title}</h3>
                        </div>
                      </div>
                      <div className="p-6">
                        <p className="text-gray-600 mb-4">{service.subtitle || (service.description?.slice(0, 120) || '')}</p>
                        <Button variant="outline" className="w-full rounded-full border-pink-500 text-pink-600 hover:bg-pink-50">{t('learnMore')}</Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
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
                {testimonials.map((testimonial, index) => (
                  <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} whileHover={{ y: -5 }}>
                    <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-white to-purple-50/30">
                      <div className="flex gap-1 mb-4">
                        {[...Array(testimonial.rating || 0)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
                      <div className="flex items-center gap-3">
                        <ImageWithFallback src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover" />
                        <div>
                          <p className="text-gray-900">{testimonial.name}</p>
                          <p className="text-gray-500">Verified Client</p>
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
                <h2 className="text-white mb-6">{cta?.heading || 'Ready to Transform?'}</h2>
                <p className="text-white/90 mb-8 max-w-2xl mx-auto">{cta?.subheading || ''}</p>
                {cta?.buttonLabel && <Button className="bg-white text-purple-600 hover:bg-gray-100 rounded-full px-8 shadow-xl">{cta.buttonLabel}</Button>}
              </motion.div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
 
