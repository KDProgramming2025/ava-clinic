import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { apiFetch } from '../api/client';

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
    // About page
    'about.title': 'About Us',
    'about.lead': "For over 15 years, we've been dedicated to helping our clients achieve natural, beautiful results through advanced hair and eyebrow implant procedures.",
    'about.valuesTitle': 'Our Core Values',
    'about.valuesSubtitle': 'The principles that guide everything we do',
  'about.missionTitle': 'Our Mission',
  'about.missionDefault': 'We strive to provide world-class services that restore confidence and enhance natural beauty with medical expertise and artistic vision.',
    'about.timelineTitle': 'Our Journey',
    'about.timelineSubtitle': 'A legacy of excellence and innovation',
    'about.skillsTitle': 'Our Expertise',
    'about.skillsSubtitle': 'We pride ourselves on maintaining the highest levels of proficiency across all our services, ensuring exceptional results for every client.',
    'about.teamTitle': 'Meet Our Team',
    'about.teamSubtitle': 'Our board-certified specialists are dedicated to your care',
    // Services page
    'services.subtitle': 'Comprehensive beauty solutions using advanced techniques and personalized care',
    'services.ctaTitle': 'Ready to Get Started?',
    'services.ctaBody': 'Book a free consultation to discuss your goals and create a personalized treatment plan',
    'services.ctaPrimary': 'Book Consultation',
    'services.ctaSecondary': 'Contact Us',
    'services.processTitle': 'Treatment Process',
    'services.faqTitle': 'Frequently Asked Questions',
    // Videos page
    'videos.title': 'Video Gallery',
    'videos.subtitle': 'Watch real procedures, patient testimonials, and expert guidance',
    'videos.all': 'All Videos',
    'videos.searchPlaceholder': 'Search videos...',
    'videos.noResults': 'No videos found matching your criteria',
    'videos.uncategorized': 'Uncategorized',
    'videos.playerLabel': 'Video Player',
    // Magazine page
    'magazine.title': 'Beauty Magazine',
    'magazine.subtitle': 'Expert insights, tips, and the latest trends in hair and beauty care',
    'magazine.featured': 'Featured',
    'magazine.latest': 'Latest Articles',
    'magazine.loadMore': 'Load More Articles',
    'magazine.categories': 'Categories',
    'magazine.trending': 'Trending Now',
    'magazine.popularTags': 'Popular Tags',
    'magazine.general': 'General',
    // Contact page
    'contact.subtitle': "We're here to answer your questions and help you begin your beauty journey",
    'contact.form.namePlaceholder': 'Your name',
    'contact.form.subjectPlaceholder': 'How can we help?',
    'contact.form.messagePlaceholder': 'Tell us more about your inquiry...',
    'contact.map.title': 'Interactive Map',
    'contact.map.addressPlaceholder': 'Your clinic address here',
    'contact.social.subtitle': 'Stay connected for beauty tips, updates, and exclusive offers',
    'contact.quickActions.title': 'Quick Actions',
    'contact.quickActions.empty': 'No quick actions configured.',
    'contact.faqs.title': 'Frequently Asked Questions',
    'contact.faqs.subtitle': 'Quick answers to common questions',
    'contact.faqs.viewAll': 'View all FAQs',
    // Booking page
    'booking.subtitle': 'Schedule your consultation or procedure in just a few simple steps',
    'booking.selectDateTimeTitle': 'Select Date & Time',
    'booking.chooseDate': 'Choose a Date',
    'booking.chooseTime': 'Choose a Time',
    'booking.noSlots': 'No available time slots for this date',
    'booking.selectDateFirst': 'Please select a date first',
    'booking.yourInformation': 'Your Information',
    'booking.fullNamePlaceholder': 'John Doe',
    'booking.additionalNotes': 'Additional Notes',
    'booking.bookingSummary': 'Booking Summary',
    'booking.note': 'Note',
    'booking.confirmedTitle': 'Booking Confirmed!',
    'booking.confirmedBody': "Thank you for choosing Beauty Implant. We've sent a confirmation email with all the details of your appointment.",
    'booking.yourAppointment': 'Your Appointment',
    'booking.confirmationNumber': 'Confirmation #',
    'booking.bookAnother': 'Book Another',
    'booking.downloadReceipt': 'Download Receipt',
    'booking.back': 'Back',
    'booking.continue': 'Continue',
    // Brand & footer
    'brand.tagline': 'Your trusted partner for natural beauty enhancement',
    'footer.linksGroupDefault': 'Links',
    'brand.name': 'Beauty Implant',
    // Alts & labels
    'hero.homeAlt': 'Beauty treatment illustration',
    'about.missionHeroAlt': 'Our clinic and facilities',
    'about.missionSecondaryAlt': 'Our treatment in progress',
    'testimonials.verifiedClient': 'Verified Client',
    // Common
    'common.loading': 'Loading…',
    'about.noStats': 'No stats available',
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
    // About page
    'about.title': 'درباره ما',
    'about.lead': 'بیش از ۱۵ سال است که با استفاده از روش‌های پیشرفته، به مراجعین کمک می‌کنیم تا به نتایج طبیعی و زیبا دست یابند.',
    'about.valuesTitle': 'ارزش‌های ما',
    'about.valuesSubtitle': 'اصولی که راهنمای کار ما هستند',
  'about.missionTitle': 'ماموریت ما',
  'about.missionDefault': 'می‌کوشیم با تکیه بر دانش پزشکی و نگاه هنری، خدماتی در سطح جهانی ارائه کنیم تا اعتمادبه‌نفس را بازگردانیم و زیبایی طبیعی را تقویت کنیم.',
    'about.timelineTitle': 'سفر ما',
    'about.timelineSubtitle': 'میراثی از برتری و نوآوری',
    'about.skillsTitle': 'تخصص ما',
    'about.skillsSubtitle': 'در بالاترین سطح مهارت در تمام خدمات خود می‌بالیم تا بهترین نتایج را ارائه دهیم.',
    'about.teamTitle': 'تیم ما را بشناسید',
    'about.teamSubtitle': 'متخصصان ما با گواهینامه‌های معتبر در کنار شما هستند',
    // Services page
    'services.subtitle': 'راه‌حل‌های جامع زیبایی با تکنیک‌های پیشرفته و مراقبت شخصی‌سازی‌شده',
    'services.ctaTitle': 'آماده شروع هستید؟',
    'services.ctaBody': 'برای مشاوره رایگان و برنامه‌ریزی درمان اختصاصی، وقت رزرو کنید',
    'services.ctaPrimary': 'رزرو مشاوره',
    'services.ctaSecondary': 'تماس با ما',
    'services.processTitle': 'فرآیند درمان',
    'services.faqTitle': 'سؤالات پرتکرار',
    // Videos page
    'videos.title': 'گالری ویدیو',
    'videos.subtitle': 'مشاهده روندهای واقعی، نظرات بیماران و راهنمایی‌های تخصصی',
    'videos.all': 'همه ویدیوها',
    'videos.searchPlaceholder': 'جستجوی ویدیو...',
    'videos.noResults': 'ویدیویی مطابق با معیارهای شما پیدا نشد',
    'videos.uncategorized': 'بدون دسته‌بندی',
    'videos.playerLabel': 'پخش‌کننده ویدیو',
    // Magazine page
    'magazine.title': 'مجله زیبایی',
    'magazine.subtitle': 'بینش‌های تخصصی، نکات و جدیدترین روندهای مراقبت از مو و زیبایی',
    'magazine.featured': 'ویژه',
    'magazine.latest': 'جدیدترین مقالات',
    'magazine.loadMore': 'بارگذاری مقالات بیشتر',
    'magazine.categories': 'دسته‌بندی‌ها',
    'magazine.trending': 'داغ‌ترین‌ها',
    'magazine.popularTags': 'برچسب‌های محبوب',
    'magazine.general': 'عمومی',
    // Contact page
    'contact.subtitle': 'برای پاسخگویی به سوالات شما و شروع مسیر زیبایی شما کنار شما هستیم',
    'contact.form.namePlaceholder': 'نام شما',
    'contact.form.subjectPlaceholder': 'چطور می‌توانیم کمک کنیم؟',
    'contact.form.messagePlaceholder': 'درباره درخواست خود بیشتر بگویید...',
    'contact.map.title': 'نقشه تعاملی',
    'contact.map.addressPlaceholder': 'آدرس کلینیک شما',
    'contact.social.subtitle': 'برای دریافت نکات زیبایی، اخبار و پیشنهادهای ویژه همراه ما باشید',
    'contact.quickActions.title': 'اقدامات سریع',
    'contact.quickActions.empty': 'اقدام سریعی تنظیم نشده است.',
    'contact.faqs.title': 'سؤالات پرتکرار',
    'contact.faqs.subtitle': 'پاسخ‌های سریع به پرسش‌های رایج',
    'contact.faqs.viewAll': 'مشاهده همه پرسش‌ها',
    // Booking page
    'booking.subtitle': 'رزرو مشاوره یا خدمات تنها در چند گام ساده',
    'booking.selectDateTimeTitle': 'انتخاب تاریخ و زمان',
    'booking.chooseDate': 'انتخاب تاریخ',
    'booking.chooseTime': 'انتخاب زمان',
    'booking.noSlots': 'برای این تاریخ زمان خالی موجود نیست',
    'booking.selectDateFirst': 'ابتدا یک تاریخ انتخاب کنید',
    'booking.yourInformation': 'اطلاعات شما',
    'booking.fullNamePlaceholder': 'نام و نام خانوادگی',
    'booking.additionalNotes': 'توضیحات تکمیلی',
    'booking.bookingSummary': 'خلاصه رزرو',
    'booking.note': 'یادداشت',
    'booking.confirmedTitle': 'رزرو تایید شد!',
    'booking.confirmedBody': 'از انتخاب شما سپاسگزاریم. ایمیل تایید شامل جزئیات قرار برای شما ارسال شد.',
    'booking.yourAppointment': 'قرار شما',
    'booking.confirmationNumber': 'شماره تایید',
    'booking.bookAnother': 'رزرو جدید',
    'booking.downloadReceipt': 'دانلود رسید',
    'booking.back': 'بازگشت',
    'booking.continue': 'ادامه',
    // Brand & footer
    'brand.tagline': 'همراه مطمئن شما برای زیبایی طبیعی',
    'footer.linksGroupDefault': 'لینک‌ها',
    'brand.name': 'کاشت زیبایی',
    // Alts & labels
    'hero.homeAlt': 'تصویر درمان زیبایی',
    'about.missionHeroAlt': 'کلینیک و امکانات ما',
    'about.missionSecondaryAlt': 'فرآیند درمان ما',
    'testimonials.verifiedClient': 'مراجع تاییدشده',
    // Common
    'common.loading': 'در حال بارگذاری…',
    'about.noStats': 'آماری در دسترس نیست',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('lang') as Language) || 'en');
  const [languages, setLanguages] = useState<Language[]>(['en', 'fa']);
  const [dyn, setDyn] = useState<Record<string, Record<string, string>>>({});

  // Load dynamic translations and enabled languages from backend
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [map, settings] = await Promise.all([
          apiFetch<Record<string, Record<string, string>>>('/translations'),
          apiFetch<any>('/settings'),
        ]);
        if (cancelled) return;
        setDyn(map || {});
        const langs = Array.isArray(settings?.settings?.languagesJson) ? settings.settings.languagesJson.filter((x: any) => typeof x === 'string') : ['en', 'fa'];
        if (langs.length) setLanguages(langs as Language[]);
      } catch {
        // ignore
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const toggleLanguage = () => {
    setLanguage((prev) => {
      const idx = languages.indexOf(prev);
      const next = languages[(idx + 1) % languages.length] || 'en';
      localStorage.setItem('lang', next);
      return next as Language;
    });
  };

  const t = (key: string): string => {
    // Dynamic override from backend first
    const dynForLang = dyn[key]?.[language];
    if (typeof dynForLang === 'string' && dynForLang.length) return dynForLang;
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
