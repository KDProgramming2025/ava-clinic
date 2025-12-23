import { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, Clock, Award, Shield, Scissors } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useServices } from '../../contexts/ServicesContext';
import { useSettings } from '../../contexts/SettingsContext';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Badge } from '../ui/badge';
import { api } from '../../api/client';
import { SEO } from '../SEO';
import { useNavigate } from 'react-router-dom';

export function ServicesPage() {
  const { t, isRTL, trc, language } = useLanguage();
  const navigate = useNavigate();
  const { services: servicesData, loading: servicesLoading } = useServices();
  const { settings } = useSettings();
  const [selectedService, setSelectedService] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const detailsRef = useRef<HTMLElement>(null);

  const services = servicesData || [];
  const loading = servicesLoading;

  const iconForService = () => <Scissors className="w-6 h-6 text-white" />;
  
  // Helper to extract bilingual text
  const getBilingualText = (item: any, field: string) => {
    if (!item) return '';
    const enField = `${field}En`;
    const faField = `${field}Fa`;
    if (language === 'fa') {
      return item[faField] || item[field] || item[enField] || '';
    } else {
      return item[enField] || item[field] || item[faField] || '';
    }
  };
  
  // Get hero content from settings
  const heroTitle = language === 'fa' 
    ? (settings?.servicesHeroTitleFa || t('ourServices'))
    : (settings?.servicesHeroTitleEn || t('ourServices'));
    
  const heroSubtitle = language === 'fa'
    ? (settings?.servicesHeroSubtitleFa || t('services.subtitle'))
    : (settings?.servicesHeroSubtitleEn || t('services.subtitle'));

  const handleServiceClick = (index: number) => {
    if (!services.length) return;
    setSelectedService(index);
    // Scroll to details section with offset for better visibility
    setTimeout(() => {
      if (detailsRef.current) {
        const element = detailsRef.current;
        const offset = window.innerWidth >= 1024 ? 100 : 20; // 100px offset on large screens, 20px on mobile
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - offset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

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
              {heroTitle}
            </h1>
            <p className="text-gray-700 max-w-3xl mx-auto">
              {heroSubtitle}
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
              const title = getBilingualText(service, 'title');
              const subtitle = getBilingualText(service, 'subtitle');
              const description = getBilingualText(service, 'description');
              return (
              <motion.div
                key={service.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                onClick={() => handleServiceClick(index)}
              >
                <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all cursor-pointer h-full">
                  <div className="relative h-56 overflow-hidden">
                    {loading && !services.length ? (
                      <div className="w-full h-full bg-gradient-to-br from-pink-200 to-purple-200 animate-pulse" />
                    ) : (
                      <ImageWithFallback
                        src={service.image}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-white text-pink-600 min-h-6">
                        {!loading && getBilingualText(service, 'priceRange')}
                      </Badge>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          {!loading && iconForService()}
                        </div>
                        <div>
                          <h3 className="text-white min-h-6">{!loading && title}</h3>
                          <p className="text-white/80 min-h-4">{!loading && subtitle}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600 mb-4 min-h-12">{!loading && description}</p>
                    <div className="flex items-center gap-4 text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-pink-500" />
                        <span className="min-h-4">{!loading && getBilingualText(service, 'duration')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-pink-500" />
                        <span className="min-h-4">{!loading && getBilingualText(service, 'recovery')}</span>
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
      <section ref={detailsRef} className="py-20 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {services.length > 0 && services[selectedService] ? (
          <Tabs defaultValue="benefits" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-12">
              <TabsTrigger value="benefits">{t('services.tabBenefits')}</TabsTrigger>
              <TabsTrigger value="process">{t('services.tabProcess')}</TabsTrigger>
              <TabsTrigger value="faq">{t('services.tabFaq')}</TabsTrigger>
            </TabsList>

            <TabsContent value="benefits" dir={isRTL ? 'rtl' : 'ltr'}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-8 bg-white shadow-xl">
                  <div className="grid lg:grid-cols-2 gap-12">
                    <div>
                      <h2 className="mb-6 text-gray-900">
                        {(() => {
                          const svcTitle = getBilingualText(services[selectedService], 'title');
                          return isRTL ? `${t('services.benefitsSuffix')} ${svcTitle}` : `${svcTitle} ${t('services.benefitsSuffix')}`;
                        })()}
                      </h2>
                      <div className="space-y-4">
                        {(services[selectedService]?.benefits || []).map((benefit: any, index: number) => {
                          const benefitText = getBilingualText(benefit, 'text');
                          return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-3"
                          >
                            <CheckCircle className="w-6 h-6 text-pink-500 flex-shrink-0 mt-1" />
                            <span className="text-gray-700">{benefitText}</span>
                          </motion.div>
                        );
                        })}
                      </div>
                    </div>
                    <div>
                      <ImageWithFallback
                        src={services[selectedService]?.image}
                        alt={getBilingualText(services[selectedService], 'title')}
                        className="rounded-2xl shadow-xl w-full h-auto"
                      />
                      <div className="mt-6 grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl">
                          <Award className="w-8 h-8 mx-auto mb-2 text-pink-500" />
                          <p className="text-gray-900">{getBilingualText(services[selectedService], 'priceRange')}</p>
                          <p className="text-gray-600">{t('services.price')}</p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl">
                          <Clock className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                          <p className="text-gray-900">{getBilingualText(services[selectedService], 'duration')}</p>
                          <p className="text-gray-600">{t('services.duration')}</p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl">
                          <Shield className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                          <p className="text-gray-900">{getBilingualText(services[selectedService], 'recovery')}</p>
                          <p className="text-gray-600">{t('services.recovery')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="process" dir={isRTL ? 'rtl' : 'ltr'}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-8 bg-white shadow-xl">
                  <h2 className="mb-8 text-center text-gray-900">{t('services.processTitle')}</h2>
                  <div className="max-w-3xl mx-auto">
                    {(services[selectedService]?.processSteps || []).map((step: any, index: number) => {
                      const stepText = getBilingualText(step, 'description');
                      const stepTitle = getBilingualText(step, 'title');
                      return (
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
                          {stepTitle && <p className="text-gray-900 font-medium mb-1">{stepTitle}</p>}
                          <p className="text-gray-900">{stepText}</p>
                          {index < ((services[selectedService]?.processSteps || []).length - 1) && (
                            <div className="h-8 w-0.5 bg-gradient-to-b from-pink-500 to-purple-600 ml-6 mt-4" />
                          )}
                        </div>
                      </motion.div>
                    );
                    })}
                  </div>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="faq" dir={isRTL ? 'rtl' : 'ltr'}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-8 bg-white shadow-xl">
                  <h2 className="mb-8 text-center text-gray-900">{t('services.faqTitle')}</h2>
                  <div className="max-w-3xl mx-auto space-y-6">
                    {(services[selectedService]?.faq || []).map((faq: any, index: number) => {
                      const question = getBilingualText(faq, 'question');
                      const answer = getBilingualText(faq, 'answer');
                      return (
                      <motion.div
                        key={faq.id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl"
                      >
                        <h3 className="mb-3 text-gray-900">{question}</h3>
                        <p className="text-gray-700">{answer}</p>
                      </motion.div>
                    );
                    })}
                  </div>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-600">{loading ? t('loading') : t('services.noServicesSelected')}</p>
            </div>
          )}
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
              {language === 'fa' 
                ? (settings?.servicesCtaTitleFa || t('services.ctaTitle'))
                : (settings?.servicesCtaTitleEn || t('services.ctaTitle'))}
            </h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              {language === 'fa'
                ? (settings?.servicesCtaBodyFa || t('services.ctaBody'))
                : (settings?.servicesCtaBodyEn || t('services.ctaBody'))}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button 
                onClick={() => {
                  navigate('/booking');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                variant="outline"
                style={{
                  borderWidth: '2px',
                  backgroundColor: 'transparent',
                  borderColor: '#ffffff',
                  color: '#ffffff',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.color = '#7c3aed';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#ffffff';
                }}
                className="rounded-full px-8 shadow-xl transition-all"
              >
                {language === 'fa'
                  ? (settings?.servicesCtaPrimaryFa || t('services.ctaPrimary'))
                  : (settings?.servicesCtaPrimaryEn || t('services.ctaPrimary'))}
              </Button>
              <Button 
                onClick={() => {
                  navigate('/contact');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                variant="outline"
                style={{
                  borderWidth: '2px',
                  borderColor: '#ffffff',
                  color: '#ffffff',
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.color = '#9333ea';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#ffffff';
                }}
                className="rounded-full px-8 transition-all"
              >
                {language === 'fa'
                  ? (settings?.servicesCtaSecondaryFa || t('services.ctaSecondary'))
                  : (settings?.servicesCtaSecondaryEn || t('services.ctaSecondary'))}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
