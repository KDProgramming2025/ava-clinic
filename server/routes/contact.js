import express from 'express';
import prisma from '../prismaClient.js';

const router = express.Router();

const stringOrNull = (value) => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return null;
};

const numberOrNull = (value) => {
  const num = typeof value === 'string' ? Number(value) : value;
  return Number.isFinite(num) ? Number(num) : null;
};

const extractBilingual = (payload = {}, key) => {
  const en = stringOrNull(payload[`${key}En`] ?? payload[`${key}_en`]);
  const fa = stringOrNull(payload[`${key}Fa`] ?? payload[`${key}_fa`]);
  const canonical = stringOrNull(payload[key]) ?? fa ?? en ?? null;
  return { canonical, en, fa };
};

router.get('/', async (_req, res) => {
  try {
    const [blocks, faq, social, quickActions, map] = await Promise.all([
      prisma.contactInfoBlock.findMany({ include: { values: true } }),
      prisma.contactFaq.findMany(),
      prisma.socialLink.findMany(),
      prisma.quickAction.findMany(),
      prisma.contactMap.findUnique({ where: { id: 1 } }),
    ]);
    res.json({ blocks, faq, social, quickActions, map: map || null });
  } catch (e) {
    res.status(500).json({ error: 'contact_fetch_failed' });
  }
});

router.put('/', async (req, res) => {
  const { blocks, faq, social, quickActions, map } = req.body;
  try {
    await prisma.$transaction(async (tx) => {
      if (blocks) {
        await tx.contactInfoValue.deleteMany();
        await tx.contactInfoBlock.deleteMany();
        for (const [index, b] of blocks.entries()) {
          const type = ['phone', 'email', 'address', 'hours'].includes(b?.type) ? b.type : 'phone';
          const title = extractBilingual(b, 'title');
          const createdBlock = await tx.contactInfoBlock.create({
            data: {
              type,
              title: title.canonical || `Contact Block ${index + 1}`,
              titleEn: title.en,
              titleFa: title.fa,
            },
          });
          if (Array.isArray(b.values)) {
            for (const v of b.values) {
              const candidate = typeof v === 'string' ? { value: v } : (v || {});
              const valuePayload = extractBilingual(candidate, 'value');
              await tx.contactInfoValue.create({
                data: {
                  value: valuePayload.canonical,
                  valueEn: valuePayload.en,
                  valueFa: valuePayload.fa,
                  blockId: createdBlock.id,
                },
              });
            }
          }
        }
      }
      if (faq) {
        await tx.contactFaq.deleteMany();
        const faqData = faq.map((f, index) => {
          const question = extractBilingual(f, 'question');
          const answer = extractBilingual(f, 'answer');
          return {
            question: question.canonical || `FAQ ${index + 1}`,
            questionEn: question.en,
            questionFa: question.fa,
            answer: answer.canonical,
            answerEn: answer.en,
            answerFa: answer.fa,
          };
        });
        if (faqData.length) await tx.contactFaq.createMany({ data: faqData });
      }
      if (social) {
        await tx.socialLink.deleteMany();
        const socialData = social.map((s, index) => {
          const platform = extractBilingual(s, 'platform');
          return {
            platform: platform.canonical || `Social ${index + 1}`,
            platformEn: platform.en,
            platformFa: platform.fa,
            url: stringOrNull(s.url) || '#',
            icon: stringOrNull(s.icon),
          };
        });
        if (socialData.length) await tx.socialLink.createMany({ data: socialData });
      }
      if (quickActions) {
        await tx.quickAction.deleteMany();
        const quickData = quickActions.map((q, index) => {
          const label = extractBilingual(q, 'label');
          const type = ['call', 'email', 'chat', 'custom'].includes(q?.type) ? q.type : 'call';
          return {
            label: label.canonical || `Action ${index + 1}`,
            labelEn: label.en,
            labelFa: label.fa,
            type,
            target: stringOrNull(q.target) || '#',
          };
        });
        if (quickData.length) await tx.quickAction.createMany({ data: quickData });
      }
      if (map && typeof map === 'object') {
        const latitude = numberOrNull(map.latitude);
        const longitude = numberOrNull(map.longitude);
        const parsedZoom = numberOrNull(map.zoom);
        const zoom = Number.isFinite(parsedZoom) ? Math.max(1, Math.min(20, Math.round(parsedZoom))) : 15;
        const markerLabel = stringOrNull(map.markerLabel);
        await tx.contactMap.upsert({
          where: { id: 1 },
          update: { latitude, longitude, zoom, markerLabel },
          create: { id: 1, latitude, longitude, zoom, markerLabel },
        });
      }
    });
    res.json({ updated: true });
  } catch (e) {
    console.error('[contact] update failed', e);
    res.status(500).json({ error: 'contact_update_failed' });
  }
});

export default router;
