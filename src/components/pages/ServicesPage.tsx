import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, Clock, Award, Shield, Scissors } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Badge } from '../ui/badge';
import { api } from '../../api/client';
import { SEO } from '../SEO';

export function ServicesPage() {
  const { t, isRTL, trc, lang } = useLanguage();
  const [selectedService, setSelectedService] = useState(0);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // used for skeleton placeholders only
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await api.services();
        if (cancelled) return;
        setServices(data || []);
        setSelectedService(0);
      } catch (e: any) {
        if (!cancelled) setError(e.message || t('services.loadFailed'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const iconForService = () => <Scissors className="w-6 h-6 text-white" />;
  const toText = (item: any) => typeof item === 'string' ? item : (item?.text || '');

  return (
    <div className="pt-20 min-h-screen">
      {/* SEO Meta */}
      {(() => {
        const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.example.com';
        const canonical = `${origin}/services`;
        const alternates = [
          { hrefLang: 'fa', href: `${origin}/services` },
            { hrefLang: 'en', href: `${origin}/services?lang=en` }
        ];
        const breadcrumb = {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: t('home'), item: origin + '/' },
            { '@type': 'ListItem', position: 2, name: t('services'), item: canonical }
          ]
        };
        return (
          <SEO
            title={t('services')}
            description={t('services.subtitle')}
            canonical={canonical}
            alternates={alternates}
            image="/og-image.jpg"
            type="website"
            jsonLd={breadcrumb}
          />
        );
      })()}
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              {t('ourServices')}
            </h1>
            <p className="text-gray-700 max-w-3xl mx-auto">
              {t('services.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && <div className="text-center py-20 text-red-600">{error}</div>}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(services.length ? services : loading ? Array.from({length:6}).map(()=>({title:'',subtitle:'',image:'',priceRange:'',duration:'',recovery:''})) : []).map((service: any, index) => {
              const title = lang === 'fa' ? (service.titleFa || service.title) : (service.titleEn || service.title);
              const subtitle = lang === 'fa' ? (service.subtitleFa || service.subtitle) : (service.subtitleEn || service.subtitle);
              const description = lang === 'fa' ? (service.descriptionFa || service.description) : (service.descriptionEn || service.description);
              return (
              <motion.div
                key={service.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                onClick={() => services.length && setSelectedService(index)}
              >
                <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all cursor-pointer h-full">
                  <div className="relative h-56 overflow-hidden">
                    {loading && !services.length ? (
                      <div className="w-full h-full bg-gradient-to-br from-pink-200 to-purple-200 animate-pulse" />
                    ) : (
                      <ImageWithFallback
                        src={service.image}
                        alt={trc(`service.${service.slug || service.id}.title`, title)}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-white text-pink-600 min-h-6">
                        {!loading && trc(`service.${service.slug || service.id}.priceRange`, service.priceRange || service.price || '')}
                      </Badge>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          {!loading && iconForService()}
                        </div>
                        <div>
                          <h3 className="text-white min-h-6">{!loading && trc(`service.${service.slug || service.id}.title`, service.title)}</h3>
                          <p className="text-white/80 min-h-4">{!loading && trc(`service.${service.slug || service.id}.subtitle`, subtitle)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600 mb-4 min-h-12">{!loading && trc(`service.${service.slug || service.id}.description`, description)}</p>
                    <div className="flex items-center gap-4 text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-pink-500" />
                        <span className="min-h-4">{!loading && trc(`service.${services[selectedService]?.slug || services[selectedService]?.id}.duration`, services[selectedService]?.duration)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-pink-500" />
                        <span className="min-h-4">{!loading && trc(`service.${services[selectedService]?.slug || services[selectedService]?.id}.recovery`, services[selectedService]?.recovery)}</span>
                      </div>
                    </div>
                    {!loading && <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-full">
                      {t('learnMore')}
                    </Button>}
                  </div>
                </Card>
              </motion.div>
            );})}
          </div>
        </div>
      </section>

      {/* Detailed Service View */}
      <section className="py-20 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="benefits" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-12">
              <TabsTrigger value="benefits">{t('services.tabBenefits')}</TabsTrigger>
              <TabsTrigger value="process">{t('services.tabProcess')}</TabsTrigger>
              <TabsTrigger value="faq">{t('services.tabFaq')}</TabsTrigger>
            </TabsList>

            <TabsContent value="benefits">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-8 bg-white shadow-xl">
                  <div className="grid lg:grid-cols-2 gap-12">
                    <div>
                      <h2 className="mb-6 text-gray-900">
                        {trc(`service.${services[selectedService]?.slug || services[selectedService]?.id}.title`, services[selectedService]?.title)} {t('services.benefitsSuffix')}
                      </h2>
                      <div className="space-y-4">
                        {(services[selectedService]?.benefits || []).map((benefit: any, index: number) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-3"
                          >
                            <CheckCircle className="w-6 h-6 text-pink-500 flex-shrink-0 mt-1" />
                            <span className="text-gray-700">{trc(`service.${services[selectedService]?.slug || services[selectedService]?.id}.benefit.${index}`, toText(benefit))}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <ImageWithFallback
                        src={services[selectedService]?.image}
                        alt={services[selectedService]?.title}
                        className="rounded-2xl shadow-xl w-full h-auto"
                      />
                      <div className="mt-6 grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl">
                          <Award className="w-8 h-8 mx-auto mb-2 text-pink-500" />
                          <p className="text-gray-900">{trc(`service.${services[selectedService]?.slug || services[selectedService]?.id}.priceRange`, services[selectedService]?.priceRange || services[selectedService]?.price || '')}</p>
                          <p className="text-gray-600">{t('services.price')}</p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl">
                          <Clock className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                          <p className="text-gray-900">{trc(`service.${services[selectedService]?.slug || services[selectedService]?.id}.duration`, services[selectedService]?.duration)}</p>
                          <p className="text-gray-600">{t('services.duration')}</p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl">
                          <Shield className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                          <p className="text-gray-900">{trc(`service.${services[selectedService]?.slug || services[selectedService]?.id}.recovery`, services[selectedService]?.recovery)}</p>
                          <p className="text-gray-600">{t('services.recovery')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="process">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-8 bg-white shadow-xl">
                  <h2 className="mb-8 text-center text-gray-900">{t('services.processTitle')}</h2>
                  <div className="max-w-3xl mx-auto">
                    {(services[selectedService]?.processSteps || services[selectedService]?.process || []).map((step: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex gap-6 mb-8 last:mb-0"
                      >
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg">
                            {step?.stepNumber ?? index + 1}
                          </div>
                        </div>
                        <div className="flex-1 pt-2">
                          <p className="text-gray-900">{trc(`service.${services[selectedService]?.slug || services[selectedService]?.id}.process.${index}`, toText(step))}</p>
                          {index < ((services[selectedService]?.processSteps || services[selectedService]?.process || []).length - 1) && (
                            <div className="h-8 w-0.5 bg-gradient-to-b from-pink-500 to-purple-600 ml-6 mt-4" />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="faq">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-8 bg-white shadow-xl">
                  <h2 className="mb-8 text-center text-gray-900">{t('services.faqTitle')}</h2>
                  <div className="max-w-3xl mx-auto space-y-6">
                    {(services[selectedService]?.faq || []).map((faq: any, index: number) => (
                      <motion.div
                        key={faq.id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl"
                      >
                        <h3 className="mb-3 text-gray-900">{trc(`service.${services[selectedService]?.slug || services[selectedService]?.id}.faq.${index}.q`, faq.question || '')}</h3>
                        <p className="text-gray-700">{trc(`service.${services[selectedService]?.slug || services[selectedService]?.id}.faq.${index}.a`, faq.answer || '')}</p>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-white mb-6">
              {t('services.ctaTitle')}
            </h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              {t('services.ctaBody')}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button className="bg-white text-purple-600 hover:bg-gray-100 rounded-full px-8 shadow-xl">
                {t('services.ctaPrimary')}
              </Button>
              <Button variant="outline" className="border-2 border-white text-white hover:bg-white/10 rounded-full px-8">
                {t('services.ctaSecondary')}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
