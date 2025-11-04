import { motion } from 'motion/react';
import { Sparkles, Award, Users, TrendingUp, Heart, Shield, Clock, Star } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { ImageWithFallback } from '../figma/ImageWithFallback';

export function HomePage() {
  const { t, isRTL } = useLanguage();

  const stats = [
    { icon: Award, value: '15+', label: t('yearsExperience') },
    { icon: Users, value: '10K+', label: t('happyClients') },
    { icon: TrendingUp, value: '98%', label: t('successRate') },
    { icon: Heart, value: '50+', label: t('specialists') },
  ];

  const features = [
    {
      icon: Shield,
      title: 'Advanced Technology',
      description: 'State-of-the-art equipment and latest techniques for natural results',
    },
    {
      icon: Award,
      title: 'Expert Team',
      description: 'Board-certified specialists with years of experience',
    },
    {
      icon: Heart,
      title: 'Personalized Care',
      description: 'Customized treatment plans tailored to your unique needs',
    },
    {
      icon: Clock,
      title: 'Quick Recovery',
      description: 'Minimally invasive procedures with fast healing times',
    },
  ];

  const services = [
    {
      title: t('hairImplant'),
      description: 'Natural hair restoration with advanced FUE technique',
      image: 'https://images.unsplash.com/photo-1624595110541-b50f76b524e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    },
    {
      title: t('eyebrowImplant'),
      description: 'Perfect eyebrow shape and density enhancement',
      image: 'https://images.unsplash.com/photo-1737746165411-bdb26bab61cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    },
    {
      title: t('eyelashImplant'),
      description: 'Long, natural-looking lashes that last',
      image: 'https://images.unsplash.com/photo-1673378630655-6a0e8eba07b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      text: 'The results exceeded my expectations! The team was professional and caring throughout the entire process.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1581065178047-8ee15951ede6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
    },
    {
      name: 'Emily Davis',
      text: 'Best decision I ever made. My eyebrows look completely natural and beautiful. Highly recommend!',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1581065178047-8ee15951ede6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
    },
    {
      name: 'Lisa Martinez',
      text: 'Professional, clean facility and amazing results. The recovery was much easier than I expected.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1581065178047-8ee15951ede6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
    },
  ];

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-pink-300/30 to-purple-300/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [90, 0, 90],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-purple-300/30 to-blue-300/30 rounded-full blur-3xl"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full mb-6"
              >
                <Sparkles className="w-5 h-5 text-pink-500" />
                <span className="text-pink-600">Premium Beauty Solutions</span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-6 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent"
              >
                {t('heroTitle')}
              </motion.h1>
              
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-6 text-gray-700"
              >
                {t('heroSubtitle')}
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-8 text-gray-600"
              >
                {t('heroDescription')}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap gap-4"
              >
                <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-full px-8 shadow-lg hover:shadow-xl transition-all">
                  {t('getStarted')}
                </Button>
                <Button variant="outline" className="rounded-full px-8 border-2 hover:bg-white/50">
                  {t('learnMore')}
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative">
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative z-10"
                >
                  <div className="rounded-3xl overflow-hidden shadow-2xl bg-white p-3">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1673378630655-6a0e8eba07b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800"
                      alt="Beauty treatment"
                      className="rounded-2xl w-full h-auto"
                    />
                  </div>
                </motion.div>
                
                {/* Floating Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 }}
                  className={`absolute top-10 ${isRTL ? 'left-0' : 'right-0'} bg-white rounded-2xl p-4 shadow-xl`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-600">Success Rate</p>
                      <p>98%</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 }}
                  className={`absolute bottom-10 ${isRTL ? 'right-0' : 'left-0'} bg-white rounded-2xl p-4 shadow-xl`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-600">Happy Clients</p>
                      <p>10,000+</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg"
              >
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-pink-500" />
                <div className="mb-1 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <p className="text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="mb-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              {t('whyChooseUs')}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experience the difference with our expert care and advanced technology
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <Card className="p-6 h-full border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-white to-pink-50/30">
                  <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="mb-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              {t('ourServices')}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive beauty solutions tailored to your needs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all">
                  <div className="relative h-64 overflow-hidden">
                    <ImageWithFallback
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white mb-2">{service.title}</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <Button variant="outline" className="w-full rounded-full border-pink-500 text-pink-600 hover:bg-pink-50">
                      {t('learnMore')}
                    </Button>
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="mb-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              {t('testimonials')}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Real experiences from our satisfied clients
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-white to-purple-50/30">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
                  <div className="flex items-center gap-3">
                    <ImageWithFallback
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-white mb-6">
              Ready to Transform Your Look?
            </h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              Book your consultation today and take the first step towards your natural beauty
            </p>
            <Button className="bg-white text-purple-600 hover:bg-gray-100 rounded-full px-8 shadow-xl">
              {t('booking')}
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
