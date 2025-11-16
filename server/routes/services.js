import express from 'express';
import prisma from '../prismaClient.js';
import { prepareMediaPathForStorage } from '../utils/mediaUrl.js';

const router = express.Router();

const SERVICE_TRANSLATION_PREFIX = 'service.';

const stringOrNull = (value) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const shouldIncludeTranslations = (req) => {
  const flag = String(req.query?.includeTranslations || '').toLowerCase();
  return flag === '1' || flag === 'true' || flag === 'yes';
};

const buildTranslationMap = (rows = []) => {
  const map = {};
  for (const row of rows) {
    if (!row?.key) continue;
    map[row.key] = row.data || {};
  }
  return map;
};

const hydrateServiceTranslations = (service, translations) => {
  if (!service) return service;
  const hydrated = { ...service };
  const baseKey = `${SERVICE_TRANSLATION_PREFIX}${hydrated.slug || hydrated.id}`;
  const translate = (suffix) => translations?.[`${baseKey}.${suffix}`];
  const assignBilingual = (field, fallback) => {
    const entry = translate(field);
    hydrated[`${field}En`] = entry?.en ?? hydrated[`${field}En`] ?? fallback ?? '';
    hydrated[`${field}Fa`] = entry?.fa ?? hydrated[`${field}Fa`] ?? fallback ?? '';
  };

  assignBilingual('title', hydrated.title || '');
  assignBilingual('subtitle', hydrated.subtitle || '');
  assignBilingual('description', hydrated.description || '');
  assignBilingual('priceRange', hydrated.priceRange || '');
  assignBilingual('duration', hydrated.duration || '');
  assignBilingual('recovery', hydrated.recovery || '');

  hydrated.benefits = (hydrated.benefits || []).map((benefit, index) => {
    const entry = translate(`benefit.${index}`);
    return {
      ...benefit,
      textEn: entry?.en ?? benefit.text ?? '',
      textFa: entry?.fa ?? benefit.text ?? '',
    };
  });

  hydrated.processSteps = (hydrated.processSteps || []).map((step, index) => {
    const entry = translate(`process.${index}`);
    return {
      ...step,
      descriptionEn: entry?.en ?? step.description ?? '',
      descriptionFa: entry?.fa ?? step.description ?? '',
    };
  });

  hydrated.faq = (hydrated.faq || []).map((item, index) => {
    const qEntry = translate(`faq.${index}.q`);
    const aEntry = translate(`faq.${index}.a`);
    return {
      ...item,
      questionEn: qEntry?.en ?? item.question ?? '',
      questionFa: qEntry?.fa ?? item.question ?? '',
      answerEn: aEntry?.en ?? item.answer ?? '',
      answerFa: aEntry?.fa ?? item.answer ?? '',
    };
  });

  return hydrated;
};

const stageTranslation = async (tx, key, values = {}) => {
  const en = stringOrNull(values.en);
  const fa = stringOrNull(values.fa);
  if (!en && !fa) {
    await tx.translation.delete({ where: { key } }).catch(() => {});
    return;
  }
  const data = {};
  if (en) data.en = en;
  if (fa) data.fa = fa;
  await tx.translation.upsert({ where: { key }, update: { data }, create: { key, data } });
};

const syncServiceTranslations = async (tx, serviceKey, payload = {}) => {
  if (!serviceKey) return;
  const base = `${SERVICE_TRANSLATION_PREFIX}${serviceKey}`;
  const existing = await tx.translation.findMany({ where: { key: { startsWith: `${base}.` } } });
  const touched = new Set();
  const stage = async (suffix, values) => {
    const key = `${base}.${suffix}`;
    touched.add(key);
    await stageTranslation(tx, key, values);
  };

  await stage('title', { en: payload.titleEn ?? payload.title, fa: payload.titleFa ?? payload.title });
  await stage('subtitle', { en: payload.subtitleEn ?? payload.subtitle, fa: payload.subtitleFa ?? payload.subtitle });
  await stage('description', { en: payload.descriptionEn ?? payload.description, fa: payload.descriptionFa ?? payload.description });
  await stage('priceRange', { en: payload.priceRangeEn ?? payload.priceRange, fa: payload.priceRangeFa ?? payload.priceRange });
  await stage('duration', { en: payload.durationEn ?? payload.duration, fa: payload.durationFa ?? payload.duration });
  await stage('recovery', { en: payload.recoveryEn ?? payload.recovery, fa: payload.recoveryFa ?? payload.recovery });

  (payload.benefits || []).forEach((benefit = {}, index) => {
    stage(`benefit.${index}`, {
      en: benefit.textEn ?? benefit.text,
      fa: benefit.textFa ?? benefit.text,
    });
  });

  (payload.processSteps || []).forEach((step = {}, index) => {
    stage(`process.${index}`, {
      en: step.descriptionEn ?? step.description,
      fa: step.descriptionFa ?? step.description,
    });
  });

  (payload.faq || []).forEach((faq = {}, index) => {
    stage(`faq.${index}.q`, {
      en: faq.questionEn ?? faq.question,
      fa: faq.questionFa ?? faq.question,
    });
    stage(`faq.${index}.a`, {
      en: faq.answerEn ?? faq.answer,
      fa: faq.answerFa ?? faq.answer,
    });
  });

  for (const entry of existing) {
    if (!touched.has(entry.key)) {
      await tx.translation.delete({ where: { key: entry.key } }).catch(() => {});
    }
  }
};

// List services (optionally include nested data)
router.get('/', async (req, res) => {
  try {
    const includeTranslations = shouldIncludeTranslations(req);
    const [services, translationRows] = await Promise.all([
      prisma.service.findMany({
        include: { benefits: true, processSteps: true, faq: true },
        orderBy: { createdAt: 'desc' },
      }),
      includeTranslations
        ? prisma.translation.findMany({ where: { key: { startsWith: SERVICE_TRANSLATION_PREFIX } } })
        : Promise.resolve([]),
    ]);
    const translationMap = includeTranslations ? buildTranslationMap(translationRows) : null;
    const enriched = includeTranslations
      ? services.map((svc) => hydrateServiceTranslations(svc, translationMap))
      : services;
    res.json(enriched);
  } catch (e) {
    res.status(500).json({ error: 'list_failed' });
  }
});

// Get single service by id or slug
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const includeTranslations = shouldIncludeTranslations(req);
    const service = await prisma.service.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: { benefits: true, processSteps: true, faq: true },
    });
    if (!service) return res.status(404).json({ error: 'not_found' });
    if (!includeTranslations) return res.json(service);
    const translationRows = await prisma.translation.findMany({
      where: { key: { startsWith: `${SERVICE_TRANSLATION_PREFIX}${service.slug || service.id}` } },
    });
    const translationMap = buildTranslationMap(translationRows);
    res.json(hydrateServiceTranslations(service, translationMap));
  } catch (e) {
    res.status(500).json({ error: 'get_failed' });
  }
});

// Create service with nested arrays (bilingual fields supported)
router.post('/', async (req, res) => {
  const payload = req.body || {};
  const baseTitle = payload.title || payload.titleEn || payload.titleFa;
  const baseDescription = payload.description || payload.descriptionEn || payload.descriptionFa;
  if (!baseTitle || !payload.slug || !baseDescription) return res.status(400).json({ error: 'missing_fields' });
  const normalizedImage = prepareMediaPathForStorage(payload.image);
  const pick = (...values) => {
    for (const value of values) {
      const normalized = stringOrNull(value);
      if (normalized) return normalized;
    }
    return null;
  };
  const normalizedBenefits = (payload.benefits || []).map((b = {}) => {
    const textEn = stringOrNull(b.textEn);
    const textFa = stringOrNull(b.textFa);
    return {
      text: pick(b.text, textEn, textFa) || '',
      textEn,
      textFa,
    };
  }).filter((b) => b.text.length);
  const normalizedSteps = (payload.processSteps || []).map((s = {}, index) => {
    const descriptionEn = stringOrNull(s.descriptionEn);
    const descriptionFa = stringOrNull(s.descriptionFa);
    return {
      stepNumber: s.stepNumber ?? index + 1,
      title: pick(s.title, s.titleEn, s.titleFa),
      description: pick(s.description, descriptionEn, descriptionFa) || '',
      descriptionEn,
      descriptionFa,
    };
  }).filter((s) => s.description.length);
  const normalizedFaq = (payload.faq || []).map((f = {}) => {
    const questionEn = stringOrNull(f.questionEn);
    const questionFa = stringOrNull(f.questionFa);
    const answerEn = stringOrNull(f.answerEn);
    const answerFa = stringOrNull(f.answerFa);
    const question = pick(f.question, questionEn, questionFa);
    const answer = pick(f.answer, answerEn, answerFa);
    if (!question || !answer) return null;
    return {
      question,
      questionEn,
      questionFa,
      answer,
      answerEn,
      answerFa,
    };
  }).filter(Boolean);

  try {
    const created = await prisma.$transaction(async (tx) => {
      const record = await tx.service.create({
        data: {
          title: baseTitle,
          titleEn: stringOrNull(payload.titleEn) || baseTitle,
          titleFa: stringOrNull(payload.titleFa) || baseTitle,
          subtitle: pick(payload.subtitle, payload.subtitleEn, payload.subtitleFa),
          subtitleEn: stringOrNull(payload.subtitleEn),
          subtitleFa: stringOrNull(payload.subtitleFa),
          slug: payload.slug,
          description: baseDescription,
          descriptionEn: stringOrNull(payload.descriptionEn) || baseDescription,
          descriptionFa: stringOrNull(payload.descriptionFa) || baseDescription,
          image: normalizedImage,
          priceRange: pick(payload.priceRange, payload.priceRangeEn, payload.priceRangeFa),
          duration: pick(payload.duration, payload.durationEn, payload.durationFa),
          durationMinutes: Number.isFinite(Number(payload.durationMinutes)) ? Number(payload.durationMinutes) : null,
          recovery: pick(payload.recovery, payload.recoveryEn, payload.recoveryFa),
          benefits: { create: normalizedBenefits.map((b) => ({ text: b.text })) },
          processSteps: { create: normalizedSteps.map((s) => ({ stepNumber: s.stepNumber, title: s.title, description: s.description })) },
          faq: { create: normalizedFaq.map((f) => ({ question: f.question, answer: f.answer })) },
        },
        include: { benefits: true, processSteps: true, faq: true },
      });
      await syncServiceTranslations(tx, record.slug || record.id, {
        ...payload,
        title: record.title,
        subtitle: record.subtitle,
        description: record.description,
        priceRange: record.priceRange,
        duration: record.duration,
        recovery: record.recovery,
        benefits: normalizedBenefits,
        processSteps: normalizedSteps,
        faq: normalizedFaq,
      });
      return record;
    });
    res.status(201).json(created);
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'slug_conflict' });
    res.status(500).json({ error: 'create_failed' });
  }
});

// Update service and replace nested arrays atomically (bilingual fields supported)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const payload = req.body || {};
  try {
    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'not_found' });

    const pick = (...values) => {
      for (const value of values) {
        const normalized = stringOrNull(value);
        if (normalized) return normalized;
      }
      return null;
    };

    const normalizedImage = payload.image !== undefined ? prepareMediaPathForStorage(payload.image) : existing.image;
    const normalizedBenefits = (payload.benefits || []).map((b = {}) => {
      const textEn = stringOrNull(b.textEn);
      const textFa = stringOrNull(b.textFa);
      const text = pick(b.text, textEn, textFa);
      if (!text) return null;
      return { text, textEn, textFa };
    }).filter(Boolean);
    const normalizedSteps = (payload.processSteps || []).map((s = {}, index) => {
      const descriptionEn = stringOrNull(s.descriptionEn);
      const descriptionFa = stringOrNull(s.descriptionFa);
      const description = pick(s.description, descriptionEn, descriptionFa);
      if (!description) return null;
      return {
        stepNumber: s.stepNumber ?? index + 1,
        title: pick(s.title, s.titleEn, s.titleFa),
        description,
        descriptionEn,
        descriptionFa,
      };
    }).filter(Boolean);
    const normalizedFaq = (payload.faq || []).map((f = {}) => {
      const questionEn = stringOrNull(f.questionEn);
      const questionFa = stringOrNull(f.questionFa);
      const answerEn = stringOrNull(f.answerEn);
      const answerFa = stringOrNull(f.answerFa);
      const question = pick(f.question, questionEn, questionFa);
      const answer = pick(f.answer, answerEn, answerFa);
      if (!question || !answer) return null;
      return { question, questionEn, questionFa, answer, answerEn, answerFa };
    }).filter(Boolean);

    // Use transaction: delete all nested then recreate and sync translations
    const updated = await prisma.$transaction(async (tx) => {
      await tx.benefit.deleteMany({ where: { serviceId: id } });
      await tx.processStep.deleteMany({ where: { serviceId: id } });
      await tx.faq.deleteMany({ where: { serviceId: id } });
      const record = await tx.service.update({
        where: { id },
        data: {
          title: pick(payload.title, payload.titleEn, payload.titleFa, existing.title) || existing.title,
          titleEn: stringOrNull(payload.titleEn) || existing.titleEn,
          titleFa: stringOrNull(payload.titleFa) || existing.titleFa,
          subtitle: pick(payload.subtitle, payload.subtitleEn, payload.subtitleFa, existing.subtitle),
          subtitleEn: stringOrNull(payload.subtitleEn) ?? existing.subtitleEn,
          subtitleFa: stringOrNull(payload.subtitleFa) ?? existing.subtitleFa,
          slug: payload.slug || existing.slug,
          description: pick(payload.description, payload.descriptionEn, payload.descriptionFa, existing.description) || existing.description,
          descriptionEn: stringOrNull(payload.descriptionEn) ?? existing.descriptionEn,
          descriptionFa: stringOrNull(payload.descriptionFa) ?? existing.descriptionFa,
          image: normalizedImage,
          priceRange: pick(payload.priceRange, payload.priceRangeEn, payload.priceRangeFa, existing.priceRange),
          duration: pick(payload.duration, payload.durationEn, payload.durationFa, existing.duration),
          durationMinutes: payload.durationMinutes !== undefined
            ? (Number.isFinite(Number(payload.durationMinutes)) ? Number(payload.durationMinutes) : null)
            : existing.durationMinutes,
          recovery: pick(payload.recovery, payload.recoveryEn, payload.recoveryFa, existing.recovery),
          benefits: { create: normalizedBenefits.map((b) => ({ text: b.text })) },
          processSteps: { create: normalizedSteps.map((s) => ({ stepNumber: s.stepNumber, title: s.title, description: s.description })) },
          faq: { create: normalizedFaq.map((f) => ({ question: f.question, answer: f.answer })) },
        },
        include: { benefits: true, processSteps: true, faq: true },
      });
      await syncServiceTranslations(tx, record.slug || record.id, {
        ...payload,
        title: record.title,
        subtitle: record.subtitle,
        description: record.description,
        priceRange: record.priceRange,
        duration: record.duration,
        recovery: record.recovery,
        benefits: normalizedBenefits,
        processSteps: normalizedSteps,
        faq: normalizedFaq,
      });
      return record;
    });
    res.json(updated);
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'slug_conflict' });
    res.status(500).json({ error: 'update_failed' });
  }
});

// Delete service and cascade nested items
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await prisma.service.delete({ where: { id } });
    res.json({ deleted: deleted.id });
  } catch (e) {
    res.status(404).json({ error: 'not_found' });
  }
});

export default router;
