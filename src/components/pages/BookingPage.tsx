import { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar as CalendarIcon, Clock, CheckCircle, User, Mail, Phone, MessageSquare, ChevronRight } from 'lucide-react';
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
import { toast } from 'sonner@2.0.3';
import { Badge } from '../ui/badge';

export function BookingPage() {
  const { t, isRTL } = useLanguage();
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');

  const services = [
    {
      id: 'hair',
      name: t('hairImplant'),
      duration: '4-8 hours',
      price: 'From $2,500',
      description: 'Advanced FUE hair transplantation',
    },
    {
      id: 'eyebrow',
      name: t('eyebrowImplant'),
      duration: '2-4 hours',
      price: 'From $1,800',
      description: 'Natural eyebrow restoration',
    },
    {
      id: 'eyelash',
      name: t('eyelashImplant'),
      duration: '2-3 hours',
      price: 'From $2,200',
      description: 'Beautiful eyelash enhancement',
    },
    {
      id: 'beard',
      name: t('beardImplant'),
      duration: '3-6 hours',
      price: 'From $3,000',
      description: 'Perfect beard styling',
    },
    {
      id: 'prp',
      name: t('prp'),
      duration: '1 hour',
      price: 'From $500',
      description: 'Natural growth stimulation',
    },
    {
      id: 'mesotherapy',
      name: t('mesotherapy'),
      duration: '30-45 min',
      price: 'From $400',
      description: 'Hair strengthening treatment',
    },
  ];

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
    '05:00 PM', '06:00 PM',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Booking confirmed! Check your email for details.');
    setStep(4);
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
              Schedule your consultation or procedure in just a few simple steps
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
                {services.map((service, index) => (
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
                        <h3 className="text-gray-900">{service.name}</h3>
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
                        {service.price}
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
              <h2 className="text-center mb-8 text-gray-900">Select Date & Time</h2>
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Calendar */}
                <Card className="p-6 border-0 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <CalendarIcon className="w-6 h-6 text-pink-500" />
                    <h3 className="text-gray-900">Choose a Date</h3>
                  </div>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-xl border-0"
                    disabled={(date) => date < new Date()}
                  />
                </Card>

                {/* Time Slots */}
                <Card className="p-6 border-0 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <Clock className="w-6 h-6 text-pink-500" />
                    <h3 className="text-gray-900">Choose a Time</h3>
                  </div>
                  {selectedDate ? (
                    <div className="grid grid-cols-2 gap-3">
                      {timeSlots.map((time) => (
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
                    <p className="text-gray-500 text-center py-12">
                      Please select a date first
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
              <h2 className="text-center mb-8 text-gray-900">Your Information</h2>
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Form */}
                <Card className="p-8 border-0 shadow-xl">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="fullname">Full Name*</Label>
                      <div className="relative mt-2">
                        <User className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
                        <Input
                          id="fullname"
                          placeholder="John Doe"
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
                      <Label htmlFor="notes">Additional Notes</Label>
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
                  <h3 className="mb-6 text-gray-900">Booking Summary</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="text-gray-600">Service:</span>
                      <span className="text-gray-900">
                        {services.find(s => s.id === selectedService)?.name}
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
                          {services.find(s => s.id === selectedService)?.price}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-white rounded-xl">
                    <p className="text-gray-600">
                      <strong>Note:</strong> This is a consultation booking. Final pricing will be discussed during your appointment based on your specific needs.
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
              
              <h2 className="mb-4 text-gray-900">Booking Confirmed!</h2>
              <p className="text-gray-600 mb-8">
                Thank you for choosing Beauty Implant. We've sent a confirmation email with all the details of your appointment.
              </p>

              <Card className="p-8 border-0 shadow-xl bg-gradient-to-br from-pink-50 to-purple-50 text-left">
                <h3 className="mb-6 text-gray-900 text-center">Your Appointment</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="text-gray-900">
                      {services.find(s => s.id === selectedService)?.name}
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
                    <span className="text-gray-600">Confirmation #:</span>
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
                  Book Another
                </Button>
                <Button
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-full px-8"
                >
                  Download Receipt
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
              {[
                {
                  icon: CheckCircle,
                  title: 'Free Consultation',
                  description: 'Initial consultation is completely free with no obligations',
                },
                {
                  icon: CalendarIcon,
                  title: 'Flexible Scheduling',
                  description: 'Easy rescheduling available up to 24 hours before',
                },
                {
                  icon: Clock,
                  title: 'Quick Response',
                  description: 'We confirm all bookings within 2 hours',
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 text-center border-0 shadow-lg bg-white">
                    <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <item.icon className="w-7 h-7 text-white" />
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
