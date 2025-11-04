import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'fa';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations = {
  en: {
    home: 'Home',
    about: 'About Us',
    services: 'Services',
    videoGallery: 'Video Gallery',
    magazine: 'Magazine',
    contact: 'Contact Us',
    booking: 'Book Appointment',
    hairImplant: 'Hair Implant',
    eyebrowImplant: 'Eyebrow Implant',
    eyelashImplant: 'Eyelash Implant',
    beardImplant: 'Beard Implant',
    prp: 'PRP Treatment',
    mesotherapy: 'Mesotherapy',
    heroTitle: 'Your Natural Beauty',
    heroSubtitle: 'Expert Hair & Eyebrow Implant Solutions',
    heroDescription: 'Transform your appearance with our advanced, natural-looking implant procedures. Expert care, stunning results.',
    getStarted: 'Get Started',
    learnMore: 'Learn More',
    whyChooseUs: 'Why Choose Us',
    ourServices: 'Our Services',
    testimonials: 'What Our Clients Say',
    latestNews: 'Latest from Our Magazine',
    readMore: 'Read More',
    viewAll: 'View All',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    message: 'Message',
    send: 'Send Message',
    address: 'Address',
    followUs: 'Follow Us',
    allRights: '© 2025 Beauty Implant. All rights reserved.',
    selectService: 'Select Service',
    selectDate: 'Select Date',
    selectTime: 'Select Time',
    confirmBooking: 'Confirm Booking',
    yearsExperience: 'Years Experience',
    happyClients: 'Happy Clients',
    successRate: 'Success Rate',
    specialists: 'Specialists',
  },
  fa: {
    home: 'خانه',
    about: 'درباره ما',
    services: 'خدمات',
    videoGallery: 'گالری ویدیو',
    magazine: 'مجله',
    contact: 'تماس با ما',
    booking: 'رزرو نوبت',
    hairImplant: 'کاشت موی سر',
    eyebrowImplant: 'کاشت ابرو',
    eyelashImplant: 'کاشت مژه',
    beardImplant: 'کاشت ریش',
    prp: 'درمان PRP',
    mesotherapy: 'مزوتراپی',
    heroTitle: 'زیبایی طبیعی شما',
    heroSubtitle: 'راهکارهای تخصصی کاشت مو و ابرو',
    heroDescription: 'ظاهر خود را با روش‌های پیشرفته و طبیعی ما متحول کنید. مراقبت تخصصی، نتایج شگفت‌انگیز.',
    getStarted: 'شروع کنید',
    learnMore: 'بیشتر بدانید',
    whyChooseUs: 'چرا ما را انتخاب کنید',
    ourServices: 'خدمات ما',
    testimonials: 'نظرات مشتریان',
    latestNews: 'آخرین مطالب مجله',
    readMore: 'ادامه مطلب',
    viewAll: 'مشاهده همه',
    name: 'نام',
    email: 'ایمیل',
    phone: 'تلفن',
    message: 'پیام',
    send: 'ارسال پیام',
    address: 'آدرس',
    followUs: 'ما را دنبال کنید',
    allRights: '© ۲۰۲۵ کاشت زیبایی. تمامی حقوق محفوظ است.',
    selectService: 'انتخاب خدمت',
    selectDate: 'انتخاب تاریخ',
    selectTime: 'انتخاب زمان',
    confirmBooking: 'تایید رزرو',
    yearsExperience: 'سال تجربه',
    happyClients: 'مشتری راضی',
    successRate: 'نرخ موفقیت',
    specialists: 'متخصص',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'fa' : 'en'));
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  const isRTL = language === 'fa';

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, isRTL }}>
      <div dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'font-persian' : 'font-english'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
