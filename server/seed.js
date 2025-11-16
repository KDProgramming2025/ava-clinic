// Purge database (except existing SUPERADMIN/ADMIN users) and seed realistic bilingual mock data
// Run with: node server/seed.js
import prisma from './prismaClient.js';
import bcrypt from 'bcryptjs';

function slugify(s){return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}

async function main() {
  console.log('Seeding started...');

  // Preserve current admin users (do not delete)
  const admins = await prisma.adminUser.findMany();
  if (admins.length === 0) {
    const hash = await bcrypt.hash('admin', 12);
    await prisma.adminUser.create({ data: { email: 'admin@example.com', username: 'admin', passwordHash: hash, role: 'SUPERADMIN' } });
    console.log('Created fallback SUPERADMIN admin/admin');
  }

  // Delete everything else in dependency-safe order
  // Child relations first
  await prisma.booking.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.bookingInfo.deleteMany({});
  await prisma.media.deleteMany({});
  await prisma.video.deleteMany({});
  await prisma.videoCategory.deleteMany({});
  await prisma.translation.deleteMany({});
  await prisma.trendingTopic.deleteMany({});
  await prisma.newsletter.deleteMany({});
  await prisma.quickAction.deleteMany({});
  await prisma.socialLink.deleteMany({});
  await prisma.contactFaq.deleteMany({});
  await prisma.contactInfoValue.deleteMany({});
  await prisma.contactInfoBlock.deleteMany({});
  await prisma.aboutMissionBullet.deleteMany({});
  await prisma.aboutMission.deleteMany({});
  await prisma.aboutSkill.deleteMany({});
  await prisma.aboutValue.deleteMany({});
  await prisma.aboutTimeline.deleteMany({});
  await prisma.homeCTA.deleteMany({});
  await prisma.homeFeature.deleteMany({});
  await prisma.homeStat.deleteMany({});
  await prisma.homeHero.deleteMany({});
  await prisma.testimonial.deleteMany({});
  await prisma.article.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.teamMember.deleteMany({});
  await prisma.faq.deleteMany({});
  await prisma.processStep.deleteMany({});
  await prisma.benefit.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.navigationItem.deleteMany({});
  await prisma.footerLink.deleteMany({});
  await prisma.settings.deleteMany({});
  await prisma.bookingSettings.deleteMany({});

  console.log('Database purged (admin users preserved).');

  // Seed Services with steps, faq, benefits
  const serviceData = [
    { title_en: 'Hair Transplant', title_fa: 'کاشت مو', subtitle_en: 'Advanced follicle restoration', subtitle_fa: 'ترمیم پیشرفته فولیکول', description_en: 'State-of-the-art hair transplant techniques for natural results.', description_fa: 'تکنیک‌های پیشرفته کاشت مو برای نتایج طبیعی.', priceRange: '$2000 - $5000', duration: '4-6h', recovery: '7-14 days', benefits_en: ['Natural hairline', 'High density', 'Minimal scarring'], benefits_fa: ['خط رویش طبیعی', 'تراکم بالا', 'حداقل اسکار'], steps_en: ['Consultation & planning', 'Follicle extraction', 'Graft implantation', 'Post-operative care'], steps_fa: ['مشاوره و برنامه‌ریزی', 'استخراج فولیکول', 'کاشت گرافت', 'مراقبت بعد از عمل'], faq_en: [{q:'Is it painful?',a:'Local anesthesia minimizes pain.'},{q:'When see results?',a:'Growth begins around 3 months.'}], faq_fa: [{q:'آیا دردناک است؟',a:'بی‌حسی موضعی درد را کاهش می‌دهد.'},{q:'نتایج چه زمانی ظاهر می‌شوند؟',a:'رشد از حدود ۳ ماه شروع می‌شود.'}]},
    { title_en: 'Eyebrow Implant', title_fa: 'کاشت ابرو', subtitle_en: 'Precision eyebrow restoration', subtitle_fa: 'بازسازی دقیق ابرو', description_en: 'Restore fullness and shape to thin or damaged eyebrows.', description_fa: 'بازگرداندن پرپشتی و فرم به ابروهای نازک یا آسیب‌دیده.', priceRange: '$800 - $1500', duration: '2-3h', recovery: '5-7 days', benefits_en: ['Natural look', 'Custom shape', 'Quick recovery'], benefits_fa: ['ظاهر طبیعی', 'فرم اختصاصی', 'ریکاوری سریع'], steps_en: ['Design shape', 'Donor extraction', 'Implant follicles', 'Aftercare'], steps_fa: ['طراحی فرم', 'استخراج ناحیه اهدا', 'کاشت فولیکول', 'مراقبت بعدی'], faq_en: [{q:'Does it look natural?',a:'Yes, direction & angle are carefully set.'}], faq_fa: [{q:'آیا طبیعی به نظر می‌رسد؟',a:'بله جهت و زاویه دقیق تنظیم می‌شود.'}]},
  ];

  for (const s of serviceData) {
    const service = await prisma.service.create({ data: {
      title: s.title_en,
      subtitle: s.subtitle_en,
      slug: slugify(s.title_en),
      description: s.description_en,
      priceRange: s.priceRange,
      duration: s.duration,
      recovery: s.recovery,
    }});
      // Benefits (with translations)
      for (let i=0;i<s.benefits_en.length;i++) {
        const bEn = s.benefits_en[i];
        const benefit = await prisma.benefit.create({ data: { text: bEn, serviceId: service.id } });
        await prisma.translation.create({ data: { key: `benefit.${benefit.id}.text`, data: { en: bEn, fa: s.benefits_fa[i] } } });
      }
      // Steps (with translations)
      let stepNum=1;
      for (let i=0;i<s.steps_en.length;i++) {
        const st = s.steps_en[i];
        const step = await prisma.processStep.create({ data: { stepNumber: stepNum++, description: st, serviceId: service.id, title: st.split(' ')[0] } });
        await prisma.translation.create({ data: { key: `processStep.${step.id}.title`, data: { en: step.title || st.split(' ')[0], fa: s.steps_fa[i].split(' ')[0] } } });
        await prisma.translation.create({ data: { key: `processStep.${step.id}.description`, data: { en: st, fa: s.steps_fa[i] } } });
      }
      // FAQ (with translations)
      for (let i=0;i<s.faq_en.length;i++) {
        const f = s.faq_en[i];
        const fFa = s.faq_fa[i];
        const faq = await prisma.faq.create({ data: { question: f.q, answer: f.a, serviceId: service.id } });
        await prisma.translation.create({ data: { key: `faq.${faq.id}.question`, data: { en: f.q, fa: fFa.q } } });
        await prisma.translation.create({ data: { key: `faq.${faq.id}.answer`, data: { en: f.a, fa: fFa.a } } });
      }
    // Persian translations via Translation keys
    const baseKey = `service.${service.slug}`;
    await prisma.translation.create({ data: { key: `${baseKey}.title`, data: { en: s.title_en, fa: s.title_fa } } });
  await prisma.translation.create({ data: { key: `${baseKey}.subtitle`, data: { en: s.subtitle_en, fa: s.subtitle_fa } } });
  await prisma.translation.create({ data: { key: `${baseKey}.description`, data: { en: s.description_en, fa: s.description_fa } } });
  }

  // Team Members
  const team = [
    { name: 'Dr. Sara Mohammadi', role_en: 'Lead Surgeon', role_fa: 'جراح ارشد', bio_en: '15 years of experience in hair restoration.', bio_fa: '۱۵ سال تجربه در ترمیم مو.', image: '/images/team/sara.jpg' },
    { name: 'Dr. Reza Karimi', role_en: 'Specialist', role_fa: 'متخصص', bio_en: 'Focused on eyebrow implant precision.', bio_fa: 'متمرکز بر دقت کاشت ابرو.', image: '/images/team/reza.jpg' },
  ];
  for (const m of team) {
    await prisma.teamMember.create({ data: { name: m.name, role: m.role_en, bio: m.bio_en, image: m.image } });
    await prisma.translation.create({ data: { key: `team.${slugify(m.name)}.role`, data: { en: m.role_en, fa: m.role_fa } } });
    await prisma.translation.create({ data: { key: `team.${slugify(m.name)}.bio`, data: { en: m.bio_en, fa: m.bio_fa } } });
  }

  // Testimonials
  for (const t of [
    { name: 'Leila', text_en: 'Amazing natural results!', text_fa: 'نتایج طبیعی فوق‌العاده!', rating: 5 },
    { name: 'Arman', text_en: 'Professional and caring staff.', text_fa: 'پرسنل حرفه‌ای و دلسوز.', rating: 5 },
  ]) {
    const test = await prisma.testimonial.create({ data: { name: t.name, text: t.text_en, rating: t.rating } });
    await prisma.translation.create({ data: { key: `testimonial.${test.id}.text`, data: { en: t.text_en, fa: t.text_fa } } });
    await prisma.translation.create({ data: { key: `testimonial.${test.id}.name`, data: { en: t.name, fa: t.name } } });
  }

  // Navigation & Footer
  const nav = [
    { label_en: 'Home', label_fa: 'خانه', path: '/' },
    { label_en: 'Services', label_fa: 'خدمات', path: '/services' },
    { label_en: 'About', label_fa: 'درباره ما', path: '/about' },
    { label_en: 'Videos', label_fa: 'ویدیوها', path: '/videos' },
    { label_en: 'Magazine', label_fa: 'مجله', path: '/magazine' },
    { label_en: 'Contact', label_fa: 'تماس', path: '/contact' },
    { label_en: 'Booking', label_fa: 'رزرو', path: '/booking' },
  ];
  let order=0;
  for (const n of nav) {
    const item = await prisma.navigationItem.create({ data: { label: n.label_en, path: n.path, order: order++ } });
    await prisma.translation.create({ data: { key: `nav.${item.id}.label`, data: { en: n.label_en, fa: n.label_fa } } });
  }
  const footerLinks = [
    { label_en: 'Privacy Policy', label_fa: 'حریم خصوصی', url: '/privacy' },
    { label_en: 'Terms of Service', label_fa: 'شرایط استفاده', url: '/terms' },
    { label_en: 'Careers', label_fa: 'فرصت‌های شغلی', url: '/careers' },
  ];
  for (const f of footerLinks) {
    const link = await prisma.footerLink.create({ data: { label: f.label_en, url: f.url, group: 'legal' } });
    await prisma.translation.create({ data: { key: `footer.${link.id}.label`, data: { en: f.label_en, fa: f.label_fa } } });
  }

  // Settings with languages & per-page SEO
  await prisma.settings.create({ data: {
    siteTitle: 'Ava Beauty Clinic',
    metaDescription: 'Premium hair & eyebrow implant clinic.',
    ogImage: '/images/og-default.jpg',
    primaryColor: '#e91e63',
    secondaryColor: '#9c27b0',
    languagesJson: { default: 'fa', supported: ['fa','en'] },
    perPageSeo: {
      '/': { title: 'Ava Beauty Clinic', description: 'Leading clinic for hair & eyebrow restoration.' },
      '/services': { title: 'Services', description: 'Discover our advanced implant services.' },
      '/about': { title: 'About Us', description: 'Learn about our mission and team.' },
      '/videos': { title: 'Video Gallery', description: 'Watch procedure insights and results.' },
      '/magazine': { title: 'Magazine', description: 'Articles & insights.' },
      '/contact': { title: 'Contact', description: 'Get in touch with our specialists.' },
      '/booking': { title: 'Booking', description: 'Book your consultation.' }
    }
  }});

  // Home sections
  await prisma.homeHero.create({ data: { title: 'Redefine Confidence', subtitle: 'Expert Hair & Eyebrow Implants', description: 'Personalized treatments delivering natural, lasting results.', ctaPrimaryLabel: 'Book Now', ctaSecondaryLabel: 'Our Services', imageUrl: '/images/hero.jpg' } });
  await prisma.translation.create({ data: { key: 'home.hero.title', data: { en: 'Redefine Confidence', fa: 'بازآفرینی اعتماد به نفس' } } });
  await prisma.translation.create({ data: { key: 'home.hero.subtitle', data: { en: 'Expert Hair & Eyebrow Implants', fa: 'کاشت تخصصی مو و ابرو' } } });
  await prisma.translation.create({ data: { key: 'home.hero.description', data: { en: 'Personalized treatments delivering natural, lasting results.', fa: 'درمان‌های شخصی‌سازی‌شده با نتایج طبیعی و ماندگار.' } } });
  await prisma.translation.create({ data: { key: 'home.hero.ctaPrimary', data: { en: 'Book Now', fa: 'همین حالا رزرو کنید' } } });
  await prisma.translation.create({ data: { key: 'home.hero.ctaSecondary', data: { en: 'Our Services', fa: 'خدمات ما' } } });
  for (const st of [
    { label_en: 'Successful Procedures', label_fa: 'عملیات موفق', icon: 'award', value: 3200 },
    { label_en: 'Years of Expertise', label_fa: 'سال تجربه', icon: 'target', value: 15 },
    { label_en: 'Happy Clients', label_fa: 'مراجعین خوشحال', icon: 'heart', value: 2500 },
  ]) {
    const stat = await prisma.homeStat.create({ data: { label: st.label_en, value: st.value, icon: st.icon } });
    await prisma.translation.create({ data: { key: `home.stat.${stat.id}.label`, data: { en: st.label_en, fa: st.label_fa } } });
  }
  for (const feat of [
    { title_en: 'Natural Results', title_fa: 'نتایج طبیعی', desc_en: 'We focus on aesthetics & density.', desc_fa: 'تمرکز بر زیبایی و تراکم داریم.', icon: 'users' },
    { title_en: 'Advanced Techniques', title_fa: 'تکنیک‌های پیشرفته', desc_en: 'Modern tools & protocols.', desc_fa: 'ابزار و پروتکل‌های مدرن.', icon: 'target' },
  ]) {
    const feature = await prisma.homeFeature.create({ data: { title: feat.title_en, description: feat.desc_en, icon: feat.icon } });
    await prisma.translation.create({ data: { key: `home.feature.${feature.id}.title`, data: { en: feat.title_en, fa: feat.title_fa } } });
    await prisma.translation.create({ data: { key: `home.feature.${feature.id}.description`, data: { en: feat.desc_en, fa: feat.desc_fa } } });
  }
  await prisma.homeCTA.create({ data: { heading: 'Ready for Change?', subheading: 'Schedule your personalized assessment today.', buttonLabel: 'Start Now' } });
  await prisma.translation.create({ data: { key: 'home.cta.heading', data: { en: 'Ready for Change?', fa: 'آماده تغییر هستید؟' } } });
  await prisma.translation.create({ data: { key: 'home.cta.subheading', data: { en: 'Schedule your personalized assessment today.', fa: 'همین امروز ارزیابی شخصی‌سازی‌شده خود را برنامه‌ریزی کنید.' } } });
  await prisma.translation.create({ data: { key: 'home.cta.button', data: { en: 'Start Now', fa: 'همین حالا شروع کنید' } } });

  // About Page
  for (const tl of [
    { year: 2012, title_en: 'Founded', title_fa: 'تأسیس', desc_en: 'Clinic established with vision for excellence.', desc_fa: 'کلینیک با چشم‌انداز برتری تأسیس شد.' },
    { year: 2015, title_en: 'Expanded Services', title_fa: 'گسترش خدمات', desc_en: 'Added eyebrow specialization.', desc_fa: 'تخصص کاشت ابرو اضافه شد.' },
  ]) {
    const timeline = await prisma.aboutTimeline.create({ data: { year: tl.year, title: tl.title_en, description: tl.desc_en } });
    await prisma.translation.create({ data: { key: `about.timeline.${timeline.id}.title`, data: { en: tl.title_en, fa: tl.title_fa } } });
    await prisma.translation.create({ data: { key: `about.timeline.${timeline.id}.description`, data: { en: tl.desc_en, fa: tl.desc_fa } } });
  }
  for (const val of [
    { title_en: 'Integrity', title_fa: 'صداقت', desc_en: 'Transparent recommendations.', desc_fa: 'توصیه‌های شفاف.', icon: 'shield' },
    { title_en: 'Precision', title_fa: 'دقت', desc_en: 'Meticulous implantation.', desc_fa: 'کاشت بسیار دقیق.', icon: 'target' },
  ]) {
    const value = await prisma.aboutValue.create({ data: { title: val.title_en, description: val.desc_en, icon: val.icon } });
    await prisma.translation.create({ data: { key: `about.value.${value.id}.title`, data: { en: val.title_en, fa: val.title_fa } } });
    await prisma.translation.create({ data: { key: `about.value.${value.id}.description`, data: { en: val.desc_en, fa: val.desc_fa } } });
  }
  for (const sk of [
    { name_en: 'FUE Technique', name_fa: 'تکنیک FUE', level: 95 },
    { name_en: 'Eyebrow Design', name_fa: 'طراحی ابرو', level: 90 },
  ]) {
    const skill = await prisma.aboutSkill.create({ data: { name: sk.name_en, level: sk.level } });
    await prisma.translation.create({ data: { key: `about.skill.${skill.id}.name`, data: { en: sk.name_en, fa: sk.name_fa } } });
  }
  await prisma.aboutMission.create({ data: { heading: 'Elevating Confidence', paragraph: 'Combining science, artistry and care.', imageHeroUrl: '/images/mission-hero.jpg', imageSecondaryUrl: '/images/mission-sec.jpg' } });
  await prisma.translation.create({ data: { key: 'about.mission.heading', data: { en: 'Elevating Confidence', fa: 'افزایش اعتماد به نفس' } } });
  await prisma.translation.create({ data: { key: 'about.mission.paragraph', data: { en: 'Combining science, artistry and care.', fa: 'ترکیب دانش، هنر و مراقبت.' } } });
  for (const bullet of ['Personalized approach','Evidence-based procedures']) {
    const b = await prisma.aboutMissionBullet.create({ data: { text: bullet } });
    await prisma.translation.create({ data: { key: `about.mission.bullet.${b.id}.text`, data: { en: bullet, fa: bullet==='Personalized approach'?'رویکرد شخصی سازی شده':'روش‌های مبتنی بر شواهد' } } });
  }

  // Contact Page blocks & faq
  const phoneBlock = await prisma.contactInfoBlock.create({ data: { type: 'phone', title: 'Phone' } });
  await prisma.translation.create({ data: { key: `contact.block.${phoneBlock.id}.title`, data: { en: 'Phone', fa: 'تلفن' } } });
  for (const pv of ['+1 555 123 4567','+1 555 987 6543']) { await prisma.contactInfoValue.create({ data: { value: pv, blockId: phoneBlock.id } }); }
  const emailBlock = await prisma.contactInfoBlock.create({ data: { type: 'email', title: 'Email' } });
  await prisma.translation.create({ data: { key: `contact.block.${emailBlock.id}.title`, data: { en: 'Email', fa: 'ایمیل' } } });
  for (const ev of ['info@avabeauty.com','support@avabeauty.com']) { await prisma.contactInfoValue.create({ data: { value: ev, blockId: emailBlock.id } }); }
  const addrBlock = await prisma.contactInfoBlock.create({ data: { type: 'address', title: 'Address' } });
  await prisma.translation.create({ data: { key: `contact.block.${addrBlock.id}.title`, data: { en: 'Address', fa: 'آدرس' } } });
  await prisma.contactInfoValue.create({ data: { value: '123 Clinic Ave, Tehran', blockId: addrBlock.id } });
  const hoursBlock = await prisma.contactInfoBlock.create({ data: { type: 'hours', title: 'Working Hours' } });
  await prisma.translation.create({ data: { key: `contact.block.${hoursBlock.id}.title`, data: { en: 'Working Hours', fa: 'ساعات کاری' } } });
  await prisma.contactInfoValue.create({ data: { value: 'Sat-Wed 09:00 - 18:00', blockId: hoursBlock.id } });
  for (const cf of [
    { q_en:'Do you offer consultations?', q_fa:'آیا مشاوره ارائه می‌دهید؟', a_en:'Yes, initial assessments are free.', a_fa:'بله، ارزیابی اولیه رایگان است.' },
    { q_en:'Where are you located?', q_fa:'کجا قرار دارید؟', a_en:'Central Tehran medical district.', a_fa:'منطقه پزشکی مرکز تهران.' }
  ]) {
    const faq = await prisma.contactFaq.create({ data: { question: cf.q_en, answer: cf.a_en } });
    await prisma.translation.create({ data: { key: `contact.faq.${faq.id}.question`, data: { en: cf.q_en, fa: cf.q_fa } } });
    await prisma.translation.create({ data: { key: `contact.faq.${faq.id}.answer`, data: { en: cf.a_en, fa: cf.a_fa } } });
  }
  for (const sl of [
    { platform:'Instagram', url:'https://instagram.com/avabeautyclinic', icon:'instagram' },
    { platform:'YouTube', url:'https://youtube.com/@avabeautyclinic', icon:'youtube' },
  ]) await prisma.socialLink.create({ data: sl });
    for (const qa of [
      { label:'Call Now', type:'call', target:'tel:+15551234567' },
      { label:'Email Us', type:'email', target:'mailto:info@avabeauty.com' },
    ]) await prisma.quickAction.create({ data: qa });
    const qas = await prisma.quickAction.findMany();
    for (const qa of qas) {
      await prisma.translation.create({ data: { key: `contact.quickAction.${qa.id}.label`, data: { en: qa.label, fa: qa.label === 'Call Now' ? 'همین حالا تماس بگیرید' : 'برای ما ایمیل بفرستید' } } });
    }

  // Newsletter
  await prisma.newsletter.create({ data: { headline: 'Stay Informed', description: 'Clinic updates & hair restoration insights.', buttonLabel: 'Subscribe' } });
  await prisma.translation.create({ data: { key: 'newsletter.headline', data: { en: 'Stay Informed', fa: 'در جریان باشید' } } });
  await prisma.translation.create({ data: { key: 'newsletter.description', data: { en: 'Clinic updates & hair restoration insights.', fa: 'به‌روزرسانی‌های کلینیک و نکات ترمیم مو.' } } });
  await prisma.translation.create({ data: { key: 'newsletter.button', data: { en: 'Subscribe', fa: 'اشتراک' } } });
  // Trending topics
  let orderTT=0;
    for (const tt of ['Hair graft techniques','Eyebrow density design','Post-op care']) {
      const topic = await prisma.trendingTopic.create({ data: { text: tt, order: orderTT++ } });
      await prisma.translation.create({ data: { key: `magazine.trending.${topic.id}.text`, data: { en: tt, fa: tt === 'Hair graft techniques' ? 'تکنیک‌های گرافت مو' : tt === 'Eyebrow density design' ? 'طراحی تراکم ابرو' : 'مراقبت پس از عمل' } } });
    }

  // Booking Info cards
    for (const bi of [
      { title:'Free Consultation', description:'Book an initial assessment at no cost.', icon:'calendar', order:1 },
      { title:'Expert Surgeons', description:'Skilled medical team specialized in implants.', icon:'award', order:2 },
      { title:'Natural Aesthetics', description:'Focus on harmony and facial balance.', icon:'heart', order:3 },
    ]) await prisma.bookingInfo.create({ data: bi });
    const bookingInfos = await prisma.bookingInfo.findMany();
    for (const b of bookingInfos) {
      const faTitle = b.title === 'Free Consultation' ? 'مشاوره رایگان' : b.title === 'Expert Surgeons' ? 'جراحان متخصص' : 'زیبایی طبیعی';
      const faDesc = b.description?.includes('initial assessment') ? 'ارزیابی اولیه را بدون هزینه رزرو کنید.' : b.description?.includes('medical team') ? 'تیم پزشکی ماهر متخصص کاشت.' : 'تمرکز بر هماهنگی و تعادل صورت.';
      await prisma.translation.create({ data: { key: `booking.info.${b.id}.title`, data: { en: b.title, fa: faTitle } } });
      await prisma.translation.create({ data: { key: `booking.info.${b.id}.description`, data: { en: b.description || '', fa: faDesc } } });
    }

  // Booking Settings basic availability
  await prisma.bookingSettings.create({ data: { timeSlots: ['09:00','10:00','11:00','13:00','14:00','15:00'], blackoutDates: [], disclaimer: 'Times are approximate; confirmation required.', bufferMinutes: 15, businessHours: { days:['Sat','Sun','Mon','Tue','Wed'], open:'09:00', close:'18:00' } } });
  await prisma.translation.create({ data: { key: 'booking.settings.disclaimer', data: { en: 'Times are approximate; confirmation required.', fa: 'زمان‌ها تقریبی است؛ تایید نهایی لازم است.' } } });

  // Media placeholders
  for (const m of ['/images/hero.jpg','/images/mission-hero.jpg','/images/mission-sec.jpg']) {
    await prisma.media.create({ data: { url: m, alt: 'Clinic image' } });
  }

  // Videos & categories
  const vc = await prisma.videoCategory.create({ data: { name: 'Procedures', slug: 'procedures' } });
  await prisma.translation.create({ data: { key: `videoCategory.${vc.id}.name`, data: { en: 'Procedures', fa: 'رویه‌ها' } } });
    for (const v of [
      { title:'FUE Extraction Overview', description:'Step-by-step extraction process.', thumbnail:'/images/video1.jpg', durationSeconds:420, status:'PUBLISHED', categoryId: vc.id },
      { title:'Eyebrow Implant Design', description:'Planning a natural eyebrow shape.', thumbnail:'/images/video2.jpg', durationSeconds:300, status:'PUBLISHED', categoryId: vc.id },
    ]) {
      const vid = await prisma.video.create({ data: v });
      await prisma.translation.create({ data: { key: `video.${vid.id}.title`, data: { en: v.title, fa: v.title === 'FUE Extraction Overview' ? 'مروری بر استخراج FUE' : 'طراحی کاشت ابرو' } } });
      await prisma.translation.create({ data: { key: `video.${vid.id}.description`, data: { en: v.description || '', fa: v.title === 'FUE Extraction Overview' ? 'فرایند استخراج مرحله به مرحله.' : 'برنامه‌ریزی فرم طبیعی ابرو.' } } });
    }

  // Sample articles with categories/tags
  const cat = await prisma.category.create({ data: { name:'Guides', slug:'guides', color:'#e91e63' } });
  await prisma.translation.create({ data: { key: `category.${cat.id}.name`, data: { en: 'Guides', fa: 'راهنماها' } } });
  const tagHealthy = await prisma.tag.create({ data: { name:'care', slug:'care' } });
  const tagImplant = await prisma.tag.create({ data: { name:'implant', slug:'implant' } });
  await prisma.translation.create({ data: { key: `tag.${tagHealthy.id}.name`, data: { en: 'care', fa: 'مراقبت' } } });
  await prisma.translation.create({ data: { key: `tag.${tagImplant.id}.name`, data: { en: 'implant', fa: 'کاشت' } } });
  const author = await prisma.teamMember.create({ data: { name:'Editorial Staff', role:'Content', bio:'Clinic educational content team.' } });
  for (const art of [
    { title:'Post-Transplant Care Tips', excerpt:'Optimize recovery after procedure.', body:'Detailed care instructions...', image:'/images/article1.jpg', status:'PUBLISHED', featured:true },
    { title:'Designing the Perfect Eyebrow', excerpt:'Shape theory & natural aesthetics.', body:'Article body about eyebrow design...', image:'/images/article2.jpg', status:'PUBLISHED', featured:false },
  ]) {
    const article = await prisma.article.create({ data: { title: art.title, slug: slugify(art.title), excerpt: art.excerpt, body: art.body, image: art.image, status: art.status, featured: art.featured, publishedAt: new Date(), categoryId: cat.id, authorId: author.id } });
    // Add tags
    await prisma.article.update({ where: { id: article.id }, data: { tags: { connect: [{ id: tagHealthy.id }, { id: tagImplant.id }] } } });
  await prisma.translation.create({ data: { key: `article.${article.id}.title`, data: { en: art.title, fa: art.title === 'Post-Transplant Care Tips' ? 'نکات مراقبت پس از کاشت' : 'طراحی ابروی کامل' } } });
  await prisma.translation.create({ data: { key: `article.${article.id}.excerpt`, data: { en: art.excerpt, fa: art.excerpt.includes('Eyebrow') ? 'نظریه فرم و زیبایی طبیعی.' : 'بهینه کردن ریکاوری پس از عمل.' } } });
  await prisma.translation.create({ data: { key: `article.${article.id}.body`, data: { en: art.body, fa: art.title === 'Post-Transplant Care Tips' ? 'دستورالعمل‌های دقیق مراقبت...' : 'مقاله‌ای درباره طراحی فرم طبیعی ابرو...' } } });
  }

  // Messages & Clients sample
  const client = await prisma.client.create({ data: { name:'Parisa Rahimi', email:'parisa@example.com', phone:'+98 21 1234 5678', lastVisit: new Date(), notes:'Interested in eyebrow density improvement.' } });
  await prisma.booking.create({ data: { clientId: client.id, startTime: new Date(Date.now()+86400000), status:'CONFIRMED', notes:'Initial consultation', priceCents: 0 } });
  await prisma.message.create({ data: { fromName:'Hossein', email:'hossein@example.com', subject:'Eyebrow procedure question', body:'Looking for more details about healing process.' } });

  // Translations for static UI keys (minimal examples)
  const staticKeys = {
    'common.loading': { en:'Loading...', fa:'در حال بارگذاری...' },
    'about.valuesTitle': { en:'Our Values', fa:'ارزش‌های ما' },
    'about.valuesSubtitle': { en:'Principles that guide our care.', fa:'اصول هدایت کننده مراقبت ما.' },
    'contact.noFaq': { en:'No FAQ available.', fa:'سوال متداولی موجود نیست.' },
  };
  for (const [k,v] of Object.entries(staticKeys)) {
    await prisma.translation.create({ data: { key: k, data: v } });
  }

  console.log('Seeding completed successfully.');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(()=>prisma.$disconnect());
