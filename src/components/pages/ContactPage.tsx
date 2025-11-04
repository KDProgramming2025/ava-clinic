import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { toast } from 'sonner@2.0.3';

export function ContactPage() {
  const { t, isRTL } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Message sent successfully! We\'ll get back to you soon.');
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone',
      details: ['+1 (555) 123-4567', '+1 (555) 987-6543'],
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: Mail,
      title: 'Email',
      details: ['info@beautyimplant.com', 'support@beautyimplant.com'],
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: MapPin,
      title: 'Address',
      details: ['123 Beauty Street', 'Medical District, City 12345'],
      color: 'from-blue-500 to-purple-500',
    },
    {
      icon: Clock,
      title: 'Hours',
      details: ['Mon-Fri: 9:00 AM - 6:00 PM', 'Sat: 10:00 AM - 4:00 PM'],
      color: 'from-green-500 to-blue-500',
    },
  ];

  const faq = [
    {
      question: 'How do I book a consultation?',
      answer: 'You can book through our online booking system, call us, or send us a message through this contact form.',
    },
    {
      question: 'Do you offer free consultations?',
      answer: 'Yes! We offer complimentary initial consultations to discuss your goals and treatment options.',
    },
    {
      question: 'What should I bring to my appointment?',
      answer: 'Please bring a valid ID, your medical history, and any questions you\'d like to discuss with our specialists.',
    },
    {
      question: 'How quickly can I schedule an appointment?',
      answer: 'We typically have availability within 3-5 business days. Emergency consultations can be arranged sooner.',
    },
  ];

  const socialLinks = [
    { icon: Facebook, name: 'Facebook', url: '#', color: 'hover:text-blue-600' },
    { icon: Instagram, name: 'Instagram', url: '#', color: 'hover:text-pink-600' },
    { icon: Twitter, name: 'Twitter', url: '#', color: 'hover:text-blue-400' },
    { icon: Youtube, name: 'Youtube', url: '#', color: 'hover:text-red-600' },
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
              {t('contact')}
            </h1>
            <p className="text-gray-700 max-w-3xl mx-auto">
              We're here to answer your questions and help you begin your beauty journey
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 -mt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="p-6 border-0 shadow-xl text-center bg-white h-full">
                  <div className={`w-14 h-14 bg-gradient-to-br ${info.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <info.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="mb-3 text-gray-900">{info.title}</h3>
                  {info.details.map((detail, i) => (
                    <p key={i} className="text-gray-600">
                      {detail}
                    </p>
                  ))}
                </Card>
              </motion.div>
            ))}
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
                      <Input
                        id="name"
                        placeholder="Your name"
                        required
                        className="mt-2 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">{t('email')}*</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        required
                        className="mt-2 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">{t('phone')}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      className="mt-2 rounded-xl"
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject*</Label>
                    <Input
                      id="subject"
                      placeholder="How can we help?"
                      required
                      className="mt-2 rounded-xl"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">{t('message')}*</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us more about your inquiry..."
                      required
                      className="mt-2 rounded-xl min-h-[150px]"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl shadow-lg"
                  >
                    <Send className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t('send')}
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
                <div className="h-80 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-pink-500 mx-auto mb-4" />
                    <p className="text-gray-600">Interactive Map</p>
                    <p className="text-gray-500 mt-2">123 Beauty Street, Medical District</p>
                  </div>
                </div>
              </Card>

              {/* Social Media */}
              <Card className="p-8 border-0 shadow-xl bg-gradient-to-br from-pink-500 via-purple-600 to-blue-600 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16" />
                
                <div className="relative z-10">
                  <h3 className="mb-3 text-white">{t('followUs')}</h3>
                  <p className="text-white/90 mb-6">
                    Stay connected for beauty tips, updates, and exclusive offers
                  </p>
                  <div className="grid grid-cols-4 gap-4">
                    {socialLinks.map((social, index) => (
                      <motion.a
                        key={index}
                        href={social.url}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        whileHover={{ scale: 1.1 }}
                        className="w-14 h-14 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center transition-all"
                      >
                        <social.icon className="w-7 h-7" />
                      </motion.a>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Quick Links */}
              <Card className="p-6 border-0 shadow-xl">
                <h3 className="mb-4 text-gray-900">Quick Actions</h3>
                <div className="space-y-3">
                  <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl justify-start">
                    <Phone className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                    Call Us Now
                  </Button>
                  <Button variant="outline" className="w-full rounded-xl justify-start border-2">
                    <Mail className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                    Send Email
                  </Button>
                  <Button variant="outline" className="w-full rounded-xl justify-start border-2">
                    <MessageSquare className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                    Live Chat
                  </Button>
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
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600">
              Quick answers to common questions
            </p>
          </motion.div>

          <div className="space-y-4">
            {faq.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all">
                  <h3 className="mb-3 text-gray-900">{item.question}</h3>
                  <p className="text-gray-600">{item.answer}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600">
              Have more questions?{' '}
              <button className="text-pink-600 hover:text-pink-700">
                View all FAQs
              </button>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
