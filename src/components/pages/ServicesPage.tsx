import { useState } from 'react';
import { motion } from 'motion/react';
import { Scissors, Eye, Sparkles, Users2, Droplet, Syringe, CheckCircle, Clock, Award, Shield } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Badge } from '../ui/badge';

export function ServicesPage() {
  const { t, isRTL } = useLanguage();
  const [selectedService, setSelectedService] = useState(0);

  const services = [
    {
      id: 'hair',
      icon: Scissors,
      title: t('hairImplant'),
      subtitle: 'FUE Hair Transplantation',
      description: 'Advanced Follicular Unit Extraction technique for natural, permanent hair restoration',
      image: 'https://images.unsplash.com/photo-1624595110541-b50f76b524e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      price: 'From $2,500',
      duration: '4-8 hours',
      recovery: '7-10 days',
      benefits: [
        'Natural-looking results',
        'Minimally invasive procedure',
        'No visible scarring',
        'Permanent solution',
        'Quick recovery time',
        'High success rate',
      ],
      process: [
        'Initial consultation and assessment',
        'Hair follicle extraction from donor area',
        'Preparation of recipient sites',
        'Implantation of follicles',
        'Post-procedure care instructions',
      ],
    },
    {
      id: 'eyebrow',
      icon: Eye,
      title: t('eyebrowImplant'),
      subtitle: 'Eyebrow Restoration',
      description: 'Precision eyebrow implant for perfect shape and natural fullness',
      image: 'https://images.unsplash.com/photo-1737746165411-bdb26bab61cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      price: 'From $1,800',
      duration: '2-4 hours',
      recovery: '5-7 days',
      benefits: [
        'Customized eyebrow design',
        'Natural hair growth pattern',
        'Permanent results',
        'No daily makeup needed',
        'Boost in confidence',
        'Expert artistic approach',
      ],
      process: [
        'Face shape analysis',
        'Custom eyebrow design',
        'Follicle harvesting',
        'Precise implantation',
        'Follow-up appointments',
      ],
    },
    {
      id: 'eyelash',
      icon: Sparkles,
      title: t('eyelashImplant'),
      subtitle: 'Eyelash Enhancement',
      description: 'Beautiful, natural eyelashes that enhance your eyes permanently',
      image: 'https://images.unsplash.com/photo-1673378630655-6a0e8eba07b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      price: 'From $2,200',
      duration: '2-3 hours',
      recovery: '5-7 days',
      benefits: [
        'Long, natural lashes',
        'No extensions needed',
        'Waterproof results',
        'Safe procedure',
        'Long-lasting effect',
        'Enhanced appearance',
      ],
      process: [
        'Eye area assessment',
        'Design consultation',
        'Hair extraction',
        'Delicate implantation',
        'Aftercare guidance',
      ],
    },
    {
      id: 'beard',
      icon: Users2,
      title: t('beardImplant'),
      subtitle: 'Beard & Mustache Transplant',
      description: 'Achieve the perfect beard style with natural hair implantation',
      image: 'https://images.unsplash.com/photo-1624595110541-b50f76b524e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      price: 'From $3,000',
      duration: '3-6 hours',
      recovery: '7-10 days',
      benefits: [
        'Full beard coverage',
        'Natural growth direction',
        'Custom styling',
        'Permanent solution',
        'Masculine appearance',
        'Confidence boost',
      ],
      process: [
        'Facial structure analysis',
        'Beard design planning',
        'Donor hair extraction',
        'Strategic implantation',
        'Growth monitoring',
      ],
    },
    {
      id: 'prp',
      icon: Droplet,
      title: t('prp'),
      subtitle: 'PRP Hair Treatment',
      description: 'Platelet-Rich Plasma therapy to stimulate natural hair growth',
      image: 'https://images.unsplash.com/photo-1664549761426-6a1cb1032854?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      price: 'From $500',
      duration: '1 hour',
      recovery: 'Same day',
      benefits: [
        'Non-surgical treatment',
        'Natural growth stimulation',
        'Improved hair density',
        'Quick procedure',
        'No downtime',
        'Scientifically proven',
      ],
      process: [
        'Blood sample collection',
        'PRP preparation',
        'Scalp preparation',
        'PRP injection',
        'Multiple sessions plan',
      ],
    },
    {
      id: 'mesotherapy',
      icon: Syringe,
      title: t('mesotherapy'),
      subtitle: 'Hair Mesotherapy',
      description: 'Nutrient-rich injections to nourish and strengthen hair follicles',
      image: 'https://images.unsplash.com/photo-1664549761426-6a1cb1032854?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      price: 'From $400',
      duration: '30-45 min',
      recovery: 'Immediate',
      benefits: [
        'Hair strengthening',
        'Reduced hair loss',
        'Improved scalp health',
        'Vitamin enrichment',
        'Minimal discomfort',
        'Quick treatment',
      ],
      process: [
        'Scalp assessment',
        'Custom formula preparation',
        'Micro-injections',
        'Treatment plan setup',
        'Regular follow-ups',
      ],
    },
  ];

  return (
    <div className="pt-20 min-h-screen">
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
              Comprehensive beauty solutions using advanced techniques and personalized care
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                onClick={() => setSelectedService(index)}
              >
                <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all cursor-pointer h-full">
                  <div className="relative h-56 overflow-hidden">
                    <ImageWithFallback
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-white text-pink-600">
                        {service.price}
                      </Badge>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <service.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white">{service.title}</h3>
                          <p className="text-white/80">{service.subtitle}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <div className="flex items-center gap-4 text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-pink-500" />
                        <span>{service.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-pink-500" />
                        <span>{service.recovery}</span>
                      </div>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-full">
                      Learn More
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Service View */}
      <section className="py-20 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="benefits" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-12">
              <TabsTrigger value="benefits">Benefits</TabsTrigger>
              <TabsTrigger value="process">Process</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
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
                        {services[selectedService].title} Benefits
                      </h2>
                      <div className="space-y-4">
                        {services[selectedService].benefits.map((benefit, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-3"
                          >
                            <CheckCircle className="w-6 h-6 text-pink-500 flex-shrink-0 mt-1" />
                            <span className="text-gray-700">{benefit}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <ImageWithFallback
                        src={services[selectedService].image}
                        alt={services[selectedService].title}
                        className="rounded-2xl shadow-xl w-full h-auto"
                      />
                      <div className="mt-6 grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl">
                          <Award className="w-8 h-8 mx-auto mb-2 text-pink-500" />
                          <p className="text-gray-900">{services[selectedService].price}</p>
                          <p className="text-gray-600">Price</p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl">
                          <Clock className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                          <p className="text-gray-900">{services[selectedService].duration}</p>
                          <p className="text-gray-600">Duration</p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl">
                          <Shield className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                          <p className="text-gray-900">{services[selectedService].recovery}</p>
                          <p className="text-gray-600">Recovery</p>
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
                  <h2 className="mb-8 text-center text-gray-900">Treatment Process</h2>
                  <div className="max-w-3xl mx-auto">
                    {services[selectedService].process.map((step, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex gap-6 mb-8 last:mb-0"
                      >
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg">
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-1 pt-2">
                          <p className="text-gray-900">{step}</p>
                          {index < services[selectedService].process.length - 1 && (
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
                  <h2 className="mb-8 text-center text-gray-900">Frequently Asked Questions</h2>
                  <div className="max-w-3xl mx-auto space-y-6">
                    {[
                      {
                        q: 'How long do results last?',
                        a: 'Results are permanent for implant procedures. The implanted hair grows naturally for life.',
                      },
                      {
                        q: 'Is the procedure painful?',
                        a: 'Local anesthesia is used to ensure comfort. Most patients report minimal discomfort.',
                      },
                      {
                        q: 'When will I see results?',
                        a: 'Initial growth begins at 3-4 months, with full results visible at 12-18 months.',
                      },
                      {
                        q: 'What is the success rate?',
                        a: 'Our clinic maintains a 98% success rate with proper aftercare and follow-up.',
                      },
                    ].map((faq, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl"
                      >
                        <h3 className="mb-3 text-gray-900">{faq.q}</h3>
                        <p className="text-gray-700">{faq.a}</p>
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
              Ready to Get Started?
            </h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              Book a free consultation to discuss your goals and create a personalized treatment plan
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button className="bg-white text-purple-600 hover:bg-gray-100 rounded-full px-8 shadow-xl">
                Book Consultation
              </Button>
              <Button variant="outline" className="border-2 border-white text-white hover:bg-white/10 rounded-full px-8">
                Contact Us
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
