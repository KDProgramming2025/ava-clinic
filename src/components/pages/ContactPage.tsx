import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Facebook, Instagram, Twitter, Youtube, Globe } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { api, apiFetch } from '../../api/client';

export function ContactPage() {
  const { t, isRTL } = useLanguage();

  // Data state
  const [blocks, setBlocks] = useState<any[]>([]);
  const [faq, setFaq] = useState<any[]>([]);
  const [social, setSocial] = useState<any[]>([]);
  const [quickActions, setQuickActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setBlocks((data.blocks || []).map((b: any) => ({
          ...b,
          values: (b.values || []).map((v: any) => v.value),
        })));
        setFaq(data.faq || []);
        setSocial(data.social || []);
        setQuickActions(data.quickActions || []);
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Failed to load contact data');
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
  const hrefForQuickAction = (qa: any) => {
    switch ((qa.type || '').toLowerCase()) {
      case 'call': return `tel:${qa.target}`;
      case 'email': return `mailto:${qa.target}`;
      case 'chat': return qa.target || '#';
      default: return qa.target || '#';
    }
  };
  const iconForQuickAction = (qa: any) => {
    switch ((qa.type || '').toLowerCase()) {
      case 'call': return Phone;
      case 'email': return Mail;
      case 'chat': return MessageSquare;
      default: return Send;
    }
  };

  const primaryActionIndex = useMemo(() => quickActions.findIndex((q: any) => (q.type || '').toLowerCase() === 'call'), [quickActions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
  await apiFetch('/messages', { body: { fromName: name, email, phone, subject, body: message } });
      toast.success("Message sent successfully! We'll get back to you soon.");
      setName(''); setEmail(''); setPhone(''); setSubject(''); setMessage('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

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
              {t('contact.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 -mt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading && <div className="col-span-4 text-center py-8">Loading...</div>}
            {error && !loading && <div className="col-span-4 text-center py-8 text-red-600">{error}</div>}
            {!loading && !error && blocks.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="p-6 border-0 shadow-xl text-center bg-white h-full">
                  <div className={`w-14 h-14 bg-gradient-to-br ${colorForBlock(info.type)} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    {(() => { const Icon = iconForBlock(info.type); return <Icon className="w-7 h-7 text-white" />; })()}
                  </div>
                  <h3 className="mb-3 text-gray-900">{info.title}</h3>
                  {(info.values || []).map((detail: string, i: number) => (
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
                      <Input id="name" placeholder={t('contact.form.namePlaceholder')} required className="mt-2 rounded-xl" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="email">{t('email')}*</Label>
                      <Input id="email" type="email" placeholder="your@email.com" required className="mt-2 rounded-xl" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">{t('phone')}</Label>
                    <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" className="mt-2 rounded-xl" value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject*</Label>
                    <Input id="subject" placeholder={t('contact.form.subjectPlaceholder')} required className="mt-2 rounded-xl" value={subject} onChange={e => setSubject(e.target.value)} />
                  </div>

                  <div>
                    <Label htmlFor="message">{t('message')}*</Label>
                    <Textarea id="message" placeholder={t('contact.form.messagePlaceholder')} required className="mt-2 rounded-xl min-h-[150px]" value={message} onChange={e => setMessage(e.target.value)} />
                  </div>

                  <Button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl shadow-lg">
                    <Send className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {submitting ? 'Sending...' : t('send')}
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
                    <p className="text-gray-600">{t('contact.map.title')}</p>
                    <p className="text-gray-500 mt-2">{t('contact.map.addressPlaceholder')}</p>
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
                    {t('contact.social.subtitle')}
                  </p>
                  <div className="grid grid-cols-4 gap-4">
                    {social.map((s, index) => (
                      <motion.a
                        key={index}
                        href={s.url}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        whileHover={{ scale: 1.1 }}
                        className="w-14 h-14 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center transition-all"
                      >
                        {(() => { const Icon = iconForSocial(s.platform || s.name); return <Icon className="w-7 h-7" />; })()}
                      </motion.a>
                    ))}
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
                    return (
                      <a key={idx} href={href} target={qa.type === 'custom' || qa.type === 'chat' ? '_blank' : undefined} rel="noreferrer">
                        <Button variant={variant as any} className={className} asChild={false}>
                          <span className="flex items-center">
                            <Icon className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                            {qa.label}
                          </span>
                        </Button>
                      </a>
                    );
                  })}
                  {quickActions.length === 0 && (
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
            {faq.map((item, index) => (
              <motion.div
                key={item.id || index}
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
                {t('contact.faqs.viewAll')}
              </button>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
