import express from 'express';
import prisma from '../prismaClient.js';
import { authMiddleware } from './auth.js';
import { prepareMediaPathForStorage } from '../utils/mediaUrl.js';

const router = express.Router();

const HOME_TRANSLATION_PREFIX = 'home.';
const HERO_TRANSLATION_KEYS = {
  title: 'home.hero.title',
  subtitle: 'home.hero.subtitle',
  description: 'home.hero.description',
  ctaPrimary: 'home.hero.ctaPrimary',
  ctaSecondary: 'home.hero.ctaSecondary',
};
const CTA_TRANSLATION_KEYS = {
  heading: 'home.cta.heading',
  subheading: 'home.cta.subheading',
  button: 'home.cta.button',
};

const stringOrNull = (value) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const extractBilingual = (payload = {}, key) => {
  const en = stringOrNull(payload[`${key}En`] ?? payload[`${key}_en`]);
  const fa = stringOrNull(payload[`${key}Fa`] ?? payload[`${key}_fa`]);
  const canonical = stringOrNull(payload[key]) ?? fa ?? en ?? null;
  return { canonical, en, fa };
};

const buildTranslationMap = (entries = []) => {
  const map = {};
  for (const entry of entries) {
    if (entry?.key) map[entry.key] = entry.data || {};
  }
  return map;
};

const applyBilingualFieldFromTranslation = (record, field, translation) => {
  if (!record || !translation) return;
  const en = stringOrNull(translation.en);
  const fa = stringOrNull(translation.fa);
  if (en) record[`${field}En`] = en;
  if (fa) record[`${field}Fa`] = fa;
  if (en || fa) record[field] = en ?? fa ?? record[field] ?? null;
};

const applyHomeTranslations = (payload, translations) => {
  if (!translations || !Object.keys(translations).length) return payload;
  const next = { ...payload };
  if (payload.hero) {
    const hero = { ...payload.hero };
    applyBilingualFieldFromTranslation(hero, 'title', translations[HERO_TRANSLATION_KEYS.title]);
    applyBilingualFieldFromTranslation(hero, 'subtitle', translations[HERO_TRANSLATION_KEYS.subtitle]);
    applyBilingualFieldFromTranslation(hero, 'description', translations[HERO_TRANSLATION_KEYS.description]);
    applyBilingualFieldFromTranslation(hero, 'ctaPrimaryLabel', translations[HERO_TRANSLATION_KEYS.ctaPrimary]);
    applyBilingualFieldFromTranslation(hero, 'ctaSecondaryLabel', translations[HERO_TRANSLATION_KEYS.ctaSecondary]);
    next.hero = hero;
  }
  if (Array.isArray(payload.stats)) {
    next.stats = payload.stats.map((stat, index) => {
      const clone = { ...stat };
      const translation =
        translations[`home.stat.${stat.id}.label`] ?? translations[`home.stat.${index}.label`];
      applyBilingualFieldFromTranslation(clone, 'label', translation);
      return clone;
    });
  }
  if (Array.isArray(payload.features)) {
    next.features = payload.features.map((feature) => {
      const clone = { ...feature };
      applyBilingualFieldFromTranslation(clone, 'title', translations[`home.feature.${feature.id}.title`]);
      applyBilingualFieldFromTranslation(
        clone,
        'description',
        translations[`home.feature.${feature.id}.description`],
      );
      return clone;
    });
  }
  if (payload.cta) {
    const cta = { ...payload.cta };
    applyBilingualFieldFromTranslation(cta, 'heading', translations[CTA_TRANSLATION_KEYS.heading]);
    applyBilingualFieldFromTranslation(cta, 'subheading', translations[CTA_TRANSLATION_KEYS.subheading]);
    applyBilingualFieldFromTranslation(cta, 'buttonLabel', translations[CTA_TRANSLATION_KEYS.button]);
    next.cta = cta;
  }
  return next;
};

const initHomeTranslationSync = async (tx) => {
  const existing = await tx.translation.findMany({ where: { key: { startsWith: HOME_TRANSLATION_PREFIX } } });
  const cache = new Map(existing.map((entry) => [entry.key, entry.data || {}]));
  const dirty = new Map();
  return {
    stage(key, updates = {}) {
      if (!key || !updates || typeof updates !== 'object') return;
      const baseline = cache.get(key) || {};
      const current = { ...baseline };
      let touched = false;
      let hasUpdate = false;
      for (const [lang, value] of Object.entries(updates)) {
        hasUpdate = true;
        const normalized = stringOrNull(value);
        if (normalized) {
          if (current[lang] !== normalized) {
            current[lang] = normalized;
            touched = true;
          }
        } else if (lang in current) {
          delete current[lang];
          touched = true;
        }
      }
      if (!hasUpdate) return;
      if (!Object.keys(current).length) {
        if (cache.has(key)) {
          cache.delete(key);
          dirty.set(key, null);
        } else if (!dirty.has(key)) {
          dirty.set(key, null);
        }
        return;
      }
      cache.set(key, current);
      if (touched || !dirty.has(key)) {
        dirty.set(key, { ...current });
      }
    },
    async flush() {
      for (const [key, data] of dirty.entries()) {
        if (data === null) {
          await tx.translation.delete({ where: { key } }).catch(() => {});
        } else {
          await tx.translation.upsert({ where: { key }, update: { data }, create: { key, data } });
        }
      }
    },
  };
};

router.get('/', async (req, res) => {
  try {
    const [hero, stats, features, cta, testimonials, translations] = await Promise.all([
      prisma.homeHero.findUnique({ where: { id: 1 } }),
      prisma.homeStat.findMany(),
      prisma.homeFeature.findMany(),
      prisma.homeCTA.findUnique({ where: { id: 1 } }),
      prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }),
      prisma.translation.findMany({ where: { key: { startsWith: HOME_TRANSLATION_PREFIX } } }),
    ]);
    const sanitizedImageUrl = hero?.imageUrl ? prepareMediaPathForStorage(hero.imageUrl) : hero?.imageUrl;
    const hydratedHero = hero ? { ...hero, imageUrl: sanitizedImageUrl } : hero;
    const translationMap = buildTranslationMap(translations);
    const localized = applyHomeTranslations({ hero: hydratedHero, stats, features, cta }, translationMap);
    res.json({ ...localized, testimonials });
  } catch (e) {
    res.status(500).json({ error: 'home_fetch_failed' });
  }
});

router.put('/hero/image', authMiddleware(['SUPERADMIN','ADMIN','EDITOR']), async (req, res) => {
  const { imageUrl } = req.body || {};
  const normalizedPath = prepareMediaPathForStorage(imageUrl);
  try {
    const heroRecord = await prisma.homeHero.upsert({
      where: { id: 1 },
      update: { imageUrl: normalizedPath },
      create: { id: 1, imageUrl: normalizedPath },
      select: { imageUrl: true },
    });
    res.json({ imageUrl: heroRecord.imageUrl });
  } catch (e) {
    res.status(500).json({ error: 'hero_image_update_failed' });
  }
});

router.put('/', async (req, res) => {
  const { hero, stats, features, cta } = req.body;
  try {
    const result = await prisma.$transaction(async (tx) => {
      const translationSync = await initHomeTranslationSync(tx);
      let heroRecord;
      if (hero) {
        const title = extractBilingual(hero, 'title');
        const subtitle = extractBilingual(hero, 'subtitle');
        const description = extractBilingual(hero, 'description');
        const ctaPrimary = extractBilingual(hero, 'ctaPrimaryLabel');
        const ctaSecondary = extractBilingual(hero, 'ctaSecondaryLabel');
        const heroImagePath = prepareMediaPathForStorage(hero.imageUrl);
        const heroPayload = {
          title: title.canonical,
          titleEn: title.en,
          titleFa: title.fa,
          subtitle: subtitle.canonical,
          subtitleEn: subtitle.en,
          subtitleFa: subtitle.fa,
          description: description.canonical,
          descriptionEn: description.en,
          descriptionFa: description.fa,
          ctaPrimaryLabel: ctaPrimary.canonical,
          ctaPrimaryLabelEn: ctaPrimary.en,
          ctaPrimaryLabelFa: ctaPrimary.fa,
          ctaSecondaryLabel: ctaSecondary.canonical,
          ctaSecondaryLabelEn: ctaSecondary.en,
          ctaSecondaryLabelFa: ctaSecondary.fa,
          imageUrl: heroImagePath,
        };
        heroRecord = await tx.homeHero.upsert({
          where: { id: 1 },
            update: heroPayload,
            create: { id: 1, ...heroPayload },
        });
        translationSync.stage(HERO_TRANSLATION_KEYS.title, { en: heroPayload.titleEn ?? heroPayload.title, fa: heroPayload.titleFa });
        translationSync.stage(HERO_TRANSLATION_KEYS.subtitle, { en: heroPayload.subtitleEn ?? heroPayload.subtitle, fa: heroPayload.subtitleFa });
        translationSync.stage(HERO_TRANSLATION_KEYS.description, { en: heroPayload.descriptionEn ?? heroPayload.description, fa: heroPayload.descriptionFa });
        translationSync.stage(HERO_TRANSLATION_KEYS.ctaPrimary, { en: heroPayload.ctaPrimaryLabelEn ?? heroPayload.ctaPrimaryLabel, fa: heroPayload.ctaPrimaryLabelFa });
        translationSync.stage(HERO_TRANSLATION_KEYS.ctaSecondary, { en: heroPayload.ctaSecondaryLabelEn ?? heroPayload.ctaSecondaryLabel, fa: heroPayload.ctaSecondaryLabelFa });
      }
      if (Array.isArray(stats)) {
        await tx.homeStat.deleteMany();
        const statPayload = stats.map((s) => {
          const label = extractBilingual(s, 'label');
          const entry = {
            label: label.canonical || 'Stat',
            labelEn: label.en,
            labelFa: label.fa,
            value: Number.isFinite(Number(s.value)) ? Number(s.value) : 0,
            icon: stringOrNull(s.icon),
          };
          const statId = stringOrNull(s.id);
          if (statId) entry.id = statId;
          return entry;
        });
        if (statPayload.length) {
          await tx.homeStat.createMany({ data: statPayload });
          for (const s of statPayload) {
            translationSync.stage(`home.stat.${s.id}.label`, { en: s.labelEn ?? s.label, fa: s.labelFa });
          }
        }
      }
      if (Array.isArray(features)) {
        await tx.homeFeature.deleteMany();
        for (const f of features) {
          const title = extractBilingual(f, 'title');
          const description = extractBilingual(f, 'description');
          const data = {
            title: title.canonical || 'Feature',
            titleEn: title.en,
            titleFa: title.fa,
            description: description.canonical,
            descriptionEn: description.en,
            descriptionFa: description.fa,
            icon: stringOrNull(f.icon),
          };
          const featureId = stringOrNull(f.id);
          if (featureId) data.id = featureId;
          const created = await tx.homeFeature.create({ data });
          const featureKeyBase = `home.feature.${created.id}`;
          translationSync.stage(`${featureKeyBase}.title`, { en: data.titleEn ?? data.title, fa: data.titleFa });
          translationSync.stage(`${featureKeyBase}.description`, { en: data.descriptionEn ?? data.description, fa: data.descriptionFa });
        }
      }
      let ctaRecord;
      if (cta) {
        const heading = extractBilingual(cta, 'heading');
        const subheading = extractBilingual(cta, 'subheading');
        const buttonLabel = extractBilingual(cta, 'buttonLabel');
        const ctaPayload = {
          heading: heading.canonical,
          headingEn: heading.en,
          headingFa: heading.fa,
          subheading: subheading.canonical,
          subheadingEn: subheading.en,
          subheadingFa: subheading.fa,
          buttonLabel: buttonLabel.canonical,
          buttonLabelEn: buttonLabel.en,
          buttonLabelFa: buttonLabel.fa,
        };
        ctaRecord = await tx.homeCTA.upsert({
          where: { id: 1 },
          update: ctaPayload,
          create: { id: 1, ...ctaPayload },
        });
        translationSync.stage(CTA_TRANSLATION_KEYS.heading, { en: ctaPayload.headingEn ?? ctaPayload.heading, fa: ctaPayload.headingFa });
        translationSync.stage(CTA_TRANSLATION_KEYS.subheading, { en: ctaPayload.subheadingEn ?? ctaPayload.subheading, fa: ctaPayload.subheadingFa });
        translationSync.stage(CTA_TRANSLATION_KEYS.button, { en: ctaPayload.buttonLabelEn ?? ctaPayload.buttonLabel, fa: ctaPayload.buttonLabelFa });
      }
      await translationSync.flush();
      return { hero: heroRecord, cta: ctaRecord };
    });
    res.json({ updated: true, ...result });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('home_update_failed', e);
    res.status(500).json({ error: 'home_update_failed' });
  }
});

export default router;
