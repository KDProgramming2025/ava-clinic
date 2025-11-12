import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Calendar as CalendarIcon, Clock, CheckCircle, User, Mail, Phone, MessageSquare, ChevronRight, Star, Heart } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Calendar } from '../ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';
import { api } from '../../api/client';

export function BookingPage() {
  const { t, isRTL } = useLanguage();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [config, setConfig] = useState<any | null>(null);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [infoCards, setInfoCards] = useState<any[]>([]);

  // Map stored icon name strings to Lucide components
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    CheckCircle,
    CalendarIcon,
    Clock,
    Star,
    Heart,
  } as any;
  const renderIcon = (name?: string) => {
    const Comp = name && iconMap[name] ? iconMap[name] : CheckCircle;
    return <Comp className="w-7 h-7 text-white" />;
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
  const [svc, cfg, info] = await Promise.all([api.services(), api.bookingConfig(), api.bookingInfo()]);
        if (cancelled) return;
        setServices(svc || []);
        setConfig(cfg || {});
  setInfoCards(Array.isArray(info) ? info : []);
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!selectedDate) { setAvailableTimes([]); return; }
      try {
        setLoadingTimes(true);
        const dateStr = selectedDate.toISOString().slice(0, 10);
        const times = await api.availability(dateStr, selectedService || undefined);
        if (!cancelled) setAvailableTimes(times || []);
      } catch {
        if (!cancelled) setAvailableTimes([]);
      } finally {
        if (!cancelled) setLoadingTimes(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedDate, selectedService]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const form = e.target as HTMLFormElement;
      const fullname = (form.querySelector('#fullname') as HTMLInputElement)?.value || '';
      const email = (form.querySelector('#email-booking') as HTMLInputElement)?.value || '';
      const phone = (form.querySelector('#phone-booking') as HTMLInputElement)?.value || '';
      const notes = (form.querySelector('#notes') as HTMLTextAreaElement)?.value || '';
      if (!selectedService || !selectedDate || !selectedTime) { toast.error('Please select service, date and time'); return; }
      const client = await api.createClient({ name: fullname, email, phone });
      const [h, m] = selectedTime.split(':').map(Number);
      const start = new Date(Date.UTC(selectedDate.getUTCFullYear(), selectedDate.getUTCMonth(), selectedDate.getUTCDate(), h, m, 0));
  // Prefer per-service numeric durationMinutes when available
  const svc = services.find(s => s.id === selectedService);
  const durationMin = (svc?.durationMinutes && Number.isFinite(svc.durationMinutes)) ? svc.durationMinutes : (config?.defaultDurationMinutes ?? 60);
      const end = new Date(start.getTime() + durationMin * 60_000);
      await api.createBooking({
        clientId: client.id,
        serviceId: selectedService,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        status: 'PENDING',
        notes,
      });
      toast.success('Booking submitted! We will confirm shortly.');
      setStep(4);
    } catch (err: any) {
      toast.error(err?.message || 'Booking failed');
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-12">
      {[1, 2, 3].map((s, index) => (
        <div key={s} className="flex items-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              step >= s
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            {step > s ? <CheckCircle className="w-6 h-6" /> : s}
          </motion.div>
          {s < 3 && (
            <div
              className={`w-16 md:w-32 h-1 mx-2 ${
                step > s ? 'bg-gradient-to-r from-pink-500 to-purple-600' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

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
              {t('booking')}
            </h1>
            <p className="text-gray-700 max-w-3xl mx-auto">
              {t('booking.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Booking Flow */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {step < 4 && renderStepIndicator()}

          {/* Step 1: Select Service */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-center mb-8 text-gray-900">{t('selectService')}</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(!loading ? services : []).map((service, index) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card
                      className={`p-6 border-2 cursor-pointer transition-all ${
                        selectedService === service.id
                          ? 'border-pink-500 shadow-xl bg-gradient-to-br from-pink-50 to-purple-50'
                          : 'border-gray-200 hover:border-pink-300 shadow-lg'
                      }`}
                      onClick={() => setSelectedService(service.id)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-gray-900">{service.title || service.name}</h3>
                        {selectedService === service.id && (
                          <CheckCircle className="w-6 h-6 text-pink-500" />
                        )}
                      </div>
                      <p className="text-gray-600 mb-4">{service.description}</p>
                      <div className="flex items-center gap-4 text-gray-500 mb-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-pink-500" />
                          <span>{service.duration}</span>
                        </div>
                      </div>
                      <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                        {service.priceRange || service.price}
                      </Badge>
                    </Card>
                  </motion.div>
                ))}
              </div>
              <div className="text-center mt-8">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!selectedService}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-full px-12 shadow-lg disabled:opacity-50"
                >
                  Continue
                  <ChevronRight className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Select Date & Time */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-center mb-8 text-gray-900">{t('booking.selectDateTimeTitle')}</h2>
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Calendar */}
                <Card className="p-6 border-0 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <CalendarIcon className="w-6 h-6 text-pink-500" />
                    <h3 className="text-gray-900">{t('booking.chooseDate')}</h3>
                  </div>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(d: any) => setSelectedDate(d as Date | undefined)}
                    className="rounded-xl border-0"
                    disabled={(date: Date) => date < new Date()}
                  />
                </Card>

                {/* Time Slots */}
                <Card className="p-6 border-0 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <Clock className="w-6 h-6 text-pink-500" />
                    <h3 className="text-gray-900">{t('booking.chooseTime')}</h3>
                  </div>
                  {selectedDate ? (
                    loadingTimes ? (
                      <p className="text-gray-500 text-center py-12">Loading times…</p>
                    ) : availableTimes.length ? (
                      <div className="grid grid-cols-2 gap-3">
                        {availableTimes.map((time) => (
                          <Button
                            key={time}
                            variant={selectedTime === time ? 'default' : 'outline'}
                            onClick={() => setSelectedTime(time)}
                            className={`rounded-xl ${
                              selectedTime === time
                                ? 'bg-gradient-to-r from-pink-500 to-purple-600'
                                : ''
                            }`}
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-12">{t('booking.noSlots')}</p>
                    )
                  ) : (
                    <p className="text-gray-500 text-center py-12">
                      {t('booking.selectDateFirst')}
                    </p>
                  )}
                </Card>
              </div>
              <div className="flex gap-4 justify-center mt-8">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="rounded-full px-8"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!selectedDate || !selectedTime}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-full px-12 shadow-lg disabled:opacity-50"
                >
                  Continue
                  <ChevronRight className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Contact Information */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-center mb-8 text-gray-900">{t('booking.yourInformation')}</h2>
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Form */}
                <Card className="p-8 border-0 shadow-xl">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="fullname">{t('booking.fullNamePlaceholder')}*</Label>
                      <div className="relative mt-2">
                        <User className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
                        <Input
                          id="fullname"
                          placeholder={t('booking.fullNamePlaceholder')}
                          required
                          className={`${isRTL ? 'pr-10' : 'pl-10'} rounded-xl`}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email-booking">Email*</Label>
                      <div className="relative mt-2">
                        <Mail className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
                        <Input
                          id="email-booking"
                          type="email"
                          placeholder="john@example.com"
                          required
                          className={`${isRTL ? 'pr-10' : 'pl-10'} rounded-xl`}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone-booking">Phone*</Label>
                      <div className="relative mt-2">
                        <Phone className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
                        <Input
                          id="phone-booking"
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          required
                          className={`${isRTL ? 'pr-10' : 'pl-10'} rounded-xl`}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="notes">{t('booking.additionalNotes')}</Label>
                      <div className="relative mt-2">
                        <MessageSquare className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 text-gray-400 w-5 h-5`} />
                        <Textarea
                          id="notes"
                          placeholder="Any specific concerns or questions..."
                          className={`${isRTL ? 'pr-10' : 'pl-10'} rounded-xl min-h-[100px]`}
                        />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="button"
                        onClick={() => setStep(2)}
                        variant="outline"
                        className="flex-1 rounded-xl"
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl shadow-lg"
                      >
                        {t('confirmBooking')}
                      </Button>
                    </div>
                  </form>
                </Card>

                {/* Summary */}
                <Card className="p-8 border-0 shadow-xl bg-gradient-to-br from-pink-50 to-purple-50 h-fit">
                  <h3 className="mb-6 text-gray-900">{t('booking.bookingSummary')}</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="text-gray-600">Service:</span>
                      <span className="text-gray-900">
                        {services.find(s => s.id === selectedService)?.title || services.find(s => s.id === selectedService)?.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-gray-600">Date:</span>
                      <span className="text-gray-900">
                        {selectedDate?.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-gray-600">Time:</span>
                      <span className="text-gray-900">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-gray-600">Duration:</span>
                      <span className="text-gray-900">
                        {services.find(s => s.id === selectedService)?.duration}
                      </span>
                    </div>
                    <div className="border-t border-gray-300 pt-4 mt-4">
                      <div className="flex justify-between items-start">
                        <span className="text-gray-600">Price:</span>
                        <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                          {services.find(s => s.id === selectedService)?.priceRange || services.find(s => s.id === selectedService)?.price}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-white rounded-xl">
                    <p className="text-gray-600">
                      <strong>{t('booking.note')}:</strong> {config?.disclaimer || t('booking.confirmedBody')}
                    </p>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center max-w-2xl mx-auto"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl"
              >
                <CheckCircle className="w-16 h-16 text-white" />
              </motion.div>
              
              <h2 className="mb-4 text-gray-900">{t('booking.confirmedTitle')}</h2>
              <p className="text-gray-600 mb-8">
                {t('booking.confirmedBody')}
              </p>

              <Card className="p-8 border-0 shadow-xl bg-gradient-to-br from-pink-50 to-purple-50 text-left">
                <h3 className="mb-6 text-gray-900 text-center">{t('booking.yourAppointment')}</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="text-gray-900">
                      {services.find(s => s.id === selectedService)?.title || services.find(s => s.id === selectedService)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="text-gray-900">
                      {selectedDate?.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="text-gray-900">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('booking.confirmationNumber')}:</span>
                    <span className="text-gray-900">BK{Math.floor(Math.random() * 100000)}</span>
                  </div>
                </div>
              </Card>

              <div className="flex gap-4 justify-center mt-8">
                <Button
                  onClick={() => {
                    setStep(1);
                    setSelectedService('');
                    setSelectedDate(undefined);
                    setSelectedTime('');
                  }}
                  variant="outline"
                  className="rounded-full px-8"
                >
                  {t('booking.bookAnother')}
                </Button>
                <Button
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-full px-8"
                >
                  {t('booking.downloadReceipt')}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Info Section */}
      {step < 4 && (
        <section className="py-20 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              {(infoCards.length ? infoCards : []).map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 text-center border-0 shadow-lg bg-white">
                    <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      {renderIcon(item.icon)}
                    </div>
                    <h3 className="mb-3 text-gray-900">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
