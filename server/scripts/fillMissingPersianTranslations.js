import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import prisma from '../prismaClient.js';

// Simple heuristic dictionary for common UI phrases
const dict = new Map([
  ['home', 'صفحه اصلی'],
  ['services', 'خدمات'],
  ['service', 'خدمت'],
  ['about', 'درباره ما'],
  ['contact', 'تماس با ما'],
  ['videos', 'ویدیوها'],
  ['magazine', 'مجله'],
  ['read more', 'مطالعه بیشتر'],
  ['readmore', 'مطالعه بیشتر'],
  ['load more', 'نمایش بیشتر'],
  ['loading', 'در حال بارگذاری'],
  ['search', 'جستجو'],
  ['views', 'بازدید'],
  ['popular tags', 'برچسب‌های محبوب'],
  ['categories', 'دسته‌بندی‌ها'],
  ['featured', 'ویژه'],
  ['trending', 'داغ‌ترین‌ها'],
  ['book', 'رزرو'],
  ['booking', 'رزرو'],
  ['select service', 'انتخاب خدمت'],
  ['choose date', 'انتخاب تاریخ'],
  ['choose time', 'انتخاب زمان'],
  ['no slots', 'زمان خالی موجود نیست'],
  ['select date first', 'ابتدا تاریخ را انتخاب کنید'],
  ['continue', 'ادامه'],
  ['back', 'بازگشت'],
  ['confirm', 'تایید'],
  ['confirmed', 'تایید شد'],
  ['confirmation number', 'شماره تایید'],
  ['email', 'ایمیل'],
  ['phone', 'تلفن'],
  ['address', 'آدرس'],
  ['hours', 'ساعات کاری'],
  ['newsletter', 'خبرنامه'],
  ['subscribe', 'اشتراک'],
  ['duration', 'مدت زمان'],
  ['price', 'قیمت'],
  ['price range', 'بازه قیمت'],
  ['min read', 'دقیقه مطالعه'],
  ['no results', 'نتیجه‌ای یافت نشد'],
  ['care', 'مراقبت'],
]);

function guessFa(en) {
  if (!en || typeof en !== 'string') return '';
  const s = en.trim();
  if (!s) return '';
  // Skip translation for emails or pure phone-like strings
  if (s.includes('@')) return s; // keep emails
  if (/^\+?[0-9 .\-()]+$/.test(s)) return s; // keep phone numbers
  const key = s.toLowerCase();
  // direct matches
  if (dict.has(key)) return dict.get(key);
  // try remove punctuation and extra spaces
  const norm = key.replace(/[\-_/]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (dict.has(norm)) return dict.get(norm);
  // token-level replacements for common terms
  const tokenMap = new Map(Object.entries({
    'hair': 'مو',
    'eyebrow': 'ابرو',
    'eyelash': 'مژه',
    'transplant': 'کاشت',
    'implant': 'ایمپلنت',
    'clinic': 'کلینیک',
    'specialist': 'متخصص',
    'consultation': 'مشاوره',
    'before': 'قبل',
    'after': 'بعد',
    'gallery': 'گالری',
    'natural': 'طبیعی',
    'permanent': 'دائمی',
    'non-surgical': 'غیرجراحی',
    'anesthesia': 'بیحسی',
    'recovery': 'ریکاوری',
    'pricing': 'قیمت‌گذاری',
    'appointment': 'وقت',
    'testimonials': 'نظرات',
    'team': 'تیم',
    'articles': 'مقالات',
    'article': 'مقاله',
    'video': 'ویدیو',
    'videos': 'ویدیوها',
    'category': 'دسته',
    'categories': 'دسته‌بندی‌ها',
    'tag': 'برچسب',
    'tags': 'برچسب‌ها',
    'feature': 'ویژگی',
    'features': 'ویژگی‌ها',
    'faq': 'سؤالات متداول',
    'benefits': 'مزایا',
    'steps': 'مراحل',
    'book now': 'همین حالا رزرو کنید',
    'book an appointment': 'رزرو نوبت',
    'contact us': 'تماس با ما',
    'learn more': 'بیشتر بدانید',
  }));

  let out = s
    .replace(/\bServices\b/gi, 'خدمات')
    .replace(/\bService\b/gi, 'خدمت')
    .replace(/\bAbout\b/gi, 'درباره')
    .replace(/\bContact\b/gi, 'تماس')
    .replace(/\bBooking\b/gi, 'رزرو')
    .replace(/\bVideos?\b/gi, (m) => (m.toLowerCase().endsWith('s') ? 'ویدیوها' : 'ویدیو'))
    .replace(/\bMagazine\b/gi, 'مجله')
    .replace(/\bRead More\b/gi, 'مطالعه بیشتر')
    .replace(/\bLoad More\b/gi, 'نمایش بیشتر')
    .replace(/\bSearch\b/gi, 'جستجو')
    .replace(/\bViews?\b/gi, 'بازدید')
    .replace(/\bPopular Tags\b/gi, 'برچسب‌های محبوب')
    .replace(/\bCategories\b/gi, 'دسته‌بندی‌ها')
    .replace(/\bFeatured\b/gi, 'ویژه')
    .replace(/\bTrending\b/gi, 'داغ‌ترین‌ها')
    .replace(/\bEmail\b/gi, 'ایمیل')
    .replace(/\bPhone\b/gi, 'تلفن')
    .replace(/\bAddress\b/gi, 'آدرس')
    .replace(/\bHours\b/gi, 'ساعات کاری')
    .replace(/\bContinue\b/gi, 'ادامه')
    .replace(/\bBack\b/gi, 'بازگشت')
    .replace(/\bConfirm(ed)?\b/gi, 'تایید')
    .replace(/\bDuration\b/gi, 'مدت زمان')
    .replace(/\bPrice Range\b/gi, 'بازه قیمت')
    .replace(/\bPrice\b/gi, 'قیمت')
    .replace(/\bNo Results\b/gi, 'نتیجه‌ای یافت نشد');

  // Domain-specific phrase replacements
  out = out
    .replace(/^Dr\.?\s+/i, 'دکتر ')
    .replace(/\bLead Surgeon\b/gi, 'جراح ارشد')
    .replace(/\bEditorial Staff\b/gi, 'کادر تحریریه')
    .replace(/\bContent\b/gi, 'محتوا')
    .replace(/\bFUE Technique\b/gi, 'تکنیک FUE')
    .replace(/\bTransparent recommendations\.?/gi, 'توصیه‌های شفاف')
    .replace(/\bMeticulous implantation\.?/gi, 'کاشت دقیق')
    .replace(/\bFounded\b/gi, 'تأسیس')
    .replace(/\bHappy Clients\b/gi, 'مشتریان راضی')
    .replace(/\bRedefine Confidence\b/gi, 'تعریف دوباره اعتماد به نفس')
    .replace(/\bHigh density\b/gi, 'تراکم بالا')
    .replace(/\bMinimal scarring\b/gi, 'جای زخم حداقلی')
    .replace(/\bFollicle extraction\b/gi, 'استخراج فولیکول')
    .replace(/\bGraft implantation\b/gi, 'کاشت گرافت')
    .replace(/\bPost\-operative care\b/gi, 'مراقبت‌های پس از عمل')
    .replace(/\bIs it painful\??/gi, 'آیا درد دارد؟')
    .replace(/\bWhen see results\??/gi, 'نتایج چه زمانی دیده می‌شود؟')
    .replace(/\bSuccessful Procedures\b/gi, 'عمل‌های موفق')
    .replace(/\bYears of Expertise\b/gi, 'سال تجربه');

  // CTA and booking phrases
  out = out
    .replace(/\bBook Now\b/gi, 'همین حالا رزرو کنید')
    .replace(/\bStart Now\b/gi, 'همین حالا شروع کنید')
    .replace(/\bBook an initial assessment at no cost\.?/gi, 'رزرو ارزیابی اولیه به‌صورت رایگان')
    .replace(/\bFocus on harmony and facial balance\.?/gi, 'تمرکز بر هارمونی و توازن چهره');

  // Eyebrow specific
  out = out
    .replace(/\bCustom shape\b/gi, 'فرم سفارشی')
    .replace(/\bDesign shape\b/gi, 'طراحی فرم')
    .replace(/\bDonor extraction\b/gi, 'استخراج ناحیه دهنده')
    .replace(/\bAftercare\b/gi, 'مراقبت‌های پس از انجام')
    .replace(/\bYes, direction\s*&\s*angle are carefully set\.?/gi, 'بله، جهت و زاویه با دقت تنظیم می‌شود');

  // Footer and taxonomy
  out = out
    .replace(/\bPrivacy Policy\b/gi, 'سیاست حریم خصوصی')
    .replace(/\bCareers\b/gi, 'فرصت‌های شغلی')
    .replace(/\blegal\b/gi, 'حقوقی')
    .replace(/\bGuides\b/gi, 'راهنماها');

  // Time/number phrases
  out = out
    .replace(/\bGrowth begins around (\d+) months?\.?/i, (_, n) => `رشد حدود ${toFaDigits(n)} ماه پس از عمل آغاز می‌شود`)
    .replace(/\b(\d+)\s*-\s*(\d+)\s*h\b/gi, (_, a, b) => `${toFaDigits(a)}-${toFaDigits(b)} ساعت`);

  // General ampersand
  out = out.replace(/\s*&\s*/g, ' و ');

  // More domain phrases
  out = out
    .replace(/\bProfessional and caring staff\.?/gi, 'پرسنل حرفه‌ای و دلسوز')
    .replace(/\bRestore fullness and shape to thin or damaged eyebrows\.?/gi, 'بازگرداندن پرپشتی و فرم ابروهای کم‌پشت یا آسیب‌دیده')
    .replace(/\bWe focus on aesthetics و density\.?/gi, 'تمرکز ما بر زیبایی‌شناسی و تراکم است')
    .replace(/\bAdvanced Techniques\b/gi, 'تکنیک‌های پیشرفته')
    .replace(/\bModern tools و protocols\.?/gi, 'ابزارها و پروتکل‌های مدرن')
    .replace(/\bReady for Change\??/gi, 'آماده تغییر هستید؟')
    .replace(/\bSchedule your personalized assessment today\.?/gi, 'امروز ارزیابی شخصی‌سازی‌شده خود را برنامه‌ریزی کنید')
    .replace(/\bPersonalized approach\b/gi, 'رویکرد شخصی‌سازی‌شده')
    .replace(/\bEvidence-based procedures\b/gi, 'روش‌های مبتنی بر شواهد')
    .replace(/\bElevating Confidence\b/gi, 'ارتقای اعتماد به نفس')
    .replace(/\bCombining science, artistry and care\.?/gi, 'ترکیب علم، هنر و مراقبت')
    .replace(/\bPost-Transplant Care Tips\b/gi, 'نکات مراقبت پس از کاشت')
    .replace(/\bIntegrity\b/gi, 'صداقت')
    .replace(/\bPrecision\b/gi, 'دقت')
    .replace(/\bDo you offer consultations\??/gi, 'آیا مشاوره ارائه می‌دهید؟')
    .replace(/\bYes, initial assessments are free\.?/gi, 'بله، ارزیابی اولیه رایگان است')
    .replace(/\bWhere are you located\??/gi, 'کجا قرار دارید؟')
    .replace(/\bCentral Tehran medical district\.?/gi, 'منطقه پزشکی مرکز تهران')
    .replace(/\bExpert Surgeons\b/gi, 'جراحان متخصص')
    .replace(/\bCall Now\b/gi, 'همین حالا تماس بگیرید')
    .replace(/\bPost-op care\b/gi, 'مراقبت‌های پس از عمل')
    .replace(/\bProcedures\b/gi, 'روش‌ها')
  .replace(/\bStep-by-step extraction process\.?/gi, 'فرآیند استخراج مرحله‌به‌مرحله')
  .replace(/^Arman$/i, 'آرمان')
    .replace(/^Leila$/i, 'لیلا');

  // Price range like "$2000 - $5000" -> "۲٬۰۰۰ - ۵٬۰۰۰ دلار"
  out = out.replace(/^\$?([0-9][0-9, .]*)\s*-\s*\$?([0-9][0-9, .]*)$/g, (_, a, b) => {
    const norm = (x) => toFaDigits(String(x).replace(/[, ]/g, ''))
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1٬');
    return `${norm(a)} - ${norm(b)} دلار`;
  });

  // Opening hours like "Sat-Wed 09:00 - 18:00"
  out = out.replace(/\bSat-Wed\b/gi, 'شنبه تا چهارشنبه');

  // word-level pass
  out = out.replace(/[A-Za-z][A-Za-z\-]*/g, (w) => {
    const lw = w.toLowerCase();
    if (tokenMap.has(lw)) return tokenMap.get(lw);
    return w;
  });
  // if nothing changed, return empty to force fallback later
  if (out === s) return '';
  return out;
}

function toFaDigits(input) {
  const map = {'0':'۰','1':'۱','2':'۲','3':'۳','4':'۴','5':'۵','6':'۶','7':'۷','8':'۸','9':'۹'};
  return String(input).replace(/[0-9]/g, d => map[d]);
}

function needsFill(data) {
  const fa = (data && typeof data === 'object') ? (data.fa ?? '') : '';
  const en = (data && typeof data === 'object') ? (data.en ?? '') : '';
  const faTrim = String(fa).trim();
  const enTrim = String(en).trim();
  if (!enTrim) return false; // nothing to base on
  if (!faTrim) return true; // missing or empty
  if (faTrim === enTrim) return true; // identical -> likely untranslated
  // ASCII-only fa likely not Persian
  if (/^[\x00-\x7F]+$/.test(faTrim)) return true;
  return false;
}

async function main() {
  const items = await prisma.translation.findMany();
  let toUpdate = 0;
  const updates = [];
  const report = [];
  for (const t of items) {
    const data = (t.data && typeof t.data === 'object') ? { ...t.data } : {};
    if (!needsFill(data)) continue;
    const en = String(data.en || '').trim();
    const guessed = guessFa(en);
    const before = data.fa || '';
    data.fa = guessed || en; // prefer guessed; fallback to en
    toUpdate++;
    report.push({ key: t.key, beforeFa: before, en, afterFa: data.fa });
    updates.push(prisma.translation.update({ where: { key: t.key }, data: { data } }));
  }
  if (toUpdate === 0) {
    console.log('No translations needed filling.');
    return;
  }
  console.log(`Filling Persian for ${toUpdate} translation keys...`);
  await prisma.$transaction(updates);
  console.log('Done.');
  try {
    const outPath = path.join(process.cwd(), 'server', 'scripts', 'fa_updates_report.json');
    fs.writeFileSync(outPath, JSON.stringify({ updated: toUpdate, items: report }, null, 2), 'utf-8');
    console.log(`Report written to ${outPath}`);
  } catch (e) {
    console.warn('Failed to write report:', e?.message || e);
  }
}

main().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
