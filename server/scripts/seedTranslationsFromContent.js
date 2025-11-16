import 'dotenv/config';
import prisma from '../prismaClient.js';

function set(map, key, faVal, enVal = faVal) {
  if (!key) return;
  const data = {};
  if (typeof faVal === 'string' && faVal.length) data.fa = faVal;
  if (typeof enVal === 'string' && enVal.length) data.en = enVal;
  if (!Object.keys(data).length) return;
  map[key] = data;
}

async function main() {
  const out = {};

  // Services
  const services = await prisma.service.findMany();
  for (const s of services) {
    const base = `service.${s.slug || s.id}`;
    set(out, `${base}.title`, s.title);
    set(out, `${base}.description`, s.description ?? '');
    set(out, `${base}.duration`, s.duration ?? '');
    set(out, `${base}.priceRange`, s.priceRange ?? '');
  }

  // About: mission, bullets, values, timeline, skills
  const mission = await prisma.aboutMission.findUnique({ where: { id: 1 } });
  if (mission) {
    set(out, 'about.mission.heading', mission.heading ?? '');
    set(out, 'about.mission.paragraph', mission.paragraph ?? '');
  }
  const missionBullets = await prisma.aboutMissionBullet.findMany();
  missionBullets.forEach((b, idx) => set(out, `about.mission.bullet.${b.id || idx}`, b.text));

  const values = await prisma.aboutValue.findMany();
  values.forEach((v, idx) => {
    const k = `about.value.${v.id || idx}`;
    set(out, `${k}.title`, v.title);
    set(out, `${k}.description`, v.description ?? '');
  });

  const timeline = await prisma.aboutTimeline.findMany();
  timeline.forEach((t, idx) => {
    const k = `about.timeline.${t.id || idx}`;
    set(out, `${k}.title`, t.title);
    set(out, `${k}.description`, t.description ?? '');
  });

  const skills = await prisma.aboutSkill.findMany();
  skills.forEach((sk, idx) => set(out, `about.skill.${sk.id || idx}.name`, sk.name));

  // Team
  const team = await prisma.teamMember.findMany();
  team.forEach(m => {
    const k = `team.${m.id}`;
    set(out, `${k}.name`, m.name);
    set(out, `${k}.role`, m.role);
    set(out, `${k}.bio`, m.bio ?? '');
  });

  // Home stats (labels used on About bottom)
  const stats = await prisma.homeStat.findMany({ orderBy: { id: 'asc' } });
  stats.forEach((s, idx) => set(out, `home.stat.${idx}.label`, s.label));

  // Home hero, features, CTA
  const homeHero = await prisma.homeHero.findUnique({ where: { id: 1 } });
  if (homeHero) {
    set(out, 'home.hero.title', homeHero.title ?? '');
    set(out, 'home.hero.subtitle', homeHero.subtitle ?? '');
    set(out, 'home.hero.description', homeHero.description ?? '');
    set(out, 'home.hero.ctaPrimary', homeHero.ctaPrimaryLabel ?? '');
    set(out, 'home.hero.ctaSecondary', homeHero.ctaSecondaryLabel ?? '');
  }
  const homeFeatures = await prisma.homeFeature.findMany();
  homeFeatures.forEach((f, idx) => {
    const k = `home.feature.${f.id || idx}`;
    set(out, `${k}.title`, f.title);
    set(out, `${k}.description`, f.description ?? '');
  });
  const homeCTA = await prisma.homeCTA.findUnique({ where: { id: 1 } });
  if (homeCTA) {
    set(out, 'home.cta.heading', homeCTA.heading ?? '');
    set(out, 'home.cta.subheading', homeCTA.subheading ?? '');
    set(out, 'home.cta.button', homeCTA.buttonLabel ?? '');
  }

  // Service sub-entities: benefits, process, faq
  for (const s of services) {
    const svcKey = s.slug || s.id;
    const benefits = await prisma.benefit.findMany({ where: { serviceId: s.id } });
    benefits.forEach((b, idx) => set(out, `service.${svcKey}.benefit.${idx}`, b.text));
    const steps = await prisma.processStep.findMany({ where: { serviceId: s.id }, orderBy: { stepNumber: 'asc' } });
    steps.forEach((st, idx) => set(out, `service.${svcKey}.process.${idx}`, st.description));
    const faqs = await prisma.faq.findMany({ where: { serviceId: s.id } });
    faqs.forEach((fq, idx) => {
      set(out, `service.${svcKey}.faq.${idx}.q`, fq.question);
      set(out, `service.${svcKey}.faq.${idx}.a`, fq.answer);
    });
  }

  // Testimonials
  const testimonials = await prisma.testimonial.findMany();
  testimonials.forEach((t, idx) => {
    const k = `testimonial.${t.id || idx}`;
    set(out, `${k}.name`, t.name);
    set(out, `${k}.text`, t.text);
  });

  // Footer links & groups
  const footerLinks = await prisma.footerLink.findMany();
  footerLinks.forEach((fl, idx) => set(out, `footer.link.${fl.id || idx}.label`, fl.label));
  const footerGroups = new Set(footerLinks.map(fl => fl.group).filter(Boolean));
  footerGroups.forEach(g => set(out, `footer.group.${g}.label`, g));

  // Contact blocks, quick actions, faq
  const blocks = await prisma.contactInfoBlock.findMany({ include: { values: true } });
  blocks.forEach((b, idx) => {
    const key = `contact.block.${b.id || idx}`;
    set(out, `${key}.title`, b.title);
    (b.values || []).forEach((v, i) => set(out, `${key}.value.${i}`, v.value));
  });
  const qas = await prisma.quickAction.findMany();
  qas.forEach((qa, idx) => set(out, `contact.quick.${qa.id || idx}.label`, qa.label));
  const cfaq = await prisma.contactFaq.findMany();
  cfaq.forEach((f, idx) => {
    const k = `contact.faq.${f.id || idx}`;
    set(out, `${k}.question`, f.question);
    set(out, `${k}.answer`, f.answer);
  });

  // Booking info cards and disclaimer
  const binfo = await prisma.bookingInfo.findMany({ orderBy: { order: 'asc' } });
  binfo.forEach((bi, idx) => {
    const k = `booking.info.${bi.id || idx}`;
    set(out, `${k}.title`, bi.title);
    set(out, `${k}.description`, bi.description ?? '');
  });
  const bsettings = await prisma.bookingSettings.findUnique({ where: { id: 1 } });
  if (bsettings?.disclaimer) set(out, 'booking.disclaimer', bsettings.disclaimer);

  // Magazine: categories, tags, articles, trending
  const cats = await prisma.category.findMany();
  cats.forEach(c => set(out, `category.${c.id}.name`, c.name));
  const tags = await prisma.tag.findMany();
  tags.forEach(t => set(out, `tag.${t.id}.name`, t.name));
  const articles = await prisma.article.findMany();
  articles.forEach(a => {
    const k = `article.${a.id}`;
    set(out, `${k}.title`, a.title);
    if (a.excerpt) set(out, `${k}.excerpt`, a.excerpt);
  });
  const trending = await prisma.trendingTopic.findMany({ orderBy: { order: 'asc' } });
  trending.forEach((tt, idx) => set(out, `trending.${tt.id || idx}.text`, tt.text));

  // Videos: categories and videos
  const vcats = await prisma.videoCategory.findMany();
  vcats.forEach(vc => set(out, `video.category.${vc.id}.name`, vc.name));
  const videos = await prisma.video.findMany();
  videos.forEach(v => {
    const k = `video.${v.id}`;
    set(out, `${k}.title`, v.title);
    if (v.description) set(out, `${k}.description`, v.description);
  });

  // Upsert into Translation table
  const keys = Object.keys(out);
  console.log(`Prepared ${keys.length} translation entries.`);
  await prisma.$transaction(
    keys.map(key => prisma.translation.upsert({
      where: { key },
      update: { data: out[key] },
      create: { key, data: out[key] },
    }))
  );
  console.log('Translations upserted.');
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
