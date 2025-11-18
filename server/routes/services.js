import express from 'express';
import prisma from '../prismaClient.js';
import { prepareMediaPathForStorage } from '../utils/mediaUrl.js';

const router = express.Router();

const stringOrNull = (value) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

// List services
router.get('/', async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        benefits: true,
        processSteps: { orderBy: { stepNumber: 'asc' } },
        faq: true,
      },
    });
    res.json(services);
  } catch (error) {
    console.error('[services GET]', error.message);
    res.status(500).json({ error: 'services_fetch_failed' });
  }
});

// Get a single service by ID
router.get('/:id', async (req, res) => {
  try {
    const service = await prisma.service.findUnique({
      where: { id: req.params.id },
      include: {
        benefits: true,
        processSteps: { orderBy: { stepNumber: 'asc' } },
        faq: true,
      },
    });
    if (!service) return res.status(404).json({ error: 'service_not_found' });
    res.json(service);
  } catch (error) {
    console.error('[service GET by ID]', error.message);
    res.status(500).json({ error: 'service_fetch_failed' });
  }
});

// Create or update service
router.post('/', async (req, res) => {
  try {
    const payload = req.body;
    if (!payload.title || !payload.slug || !payload.description) {
      return res.status(400).json({ error: 'required_fields_missing' });
    }

    const existingId = stringOrNull(payload.id);
    const slugConflict = await prisma.service.findFirst({
      where: {
        slug: payload.slug,
        ...(existingId ? { id: { not: existingId } } : {}),
      },
    });
    if (slugConflict) {
      return res.status(409).json({ error: 'slug_conflict' });
    }

    const data = {
      title: payload.title,
      slug: payload.slug,
      description: payload.description,
      subtitle: stringOrNull(payload.subtitle),
      priceRange: stringOrNull(payload.priceRange),
      duration: stringOrNull(payload.duration),
      durationMinutes: payload.durationMinutes || null,
      recovery: stringOrNull(payload.recovery),
      image: prepareMediaPathForStorage(payload.image),
      // Bilingual fields
      titleEn: stringOrNull(payload.titleEn),
      titleFa: stringOrNull(payload.titleFa),
      subtitleEn: stringOrNull(payload.subtitleEn),
      subtitleFa: stringOrNull(payload.subtitleFa),
      descriptionEn: stringOrNull(payload.descriptionEn),
      descriptionFa: stringOrNull(payload.descriptionFa),
    };

    const record = existingId
      ? await prisma.service.update({ where: { id: existingId }, data })
      : await prisma.service.create({ data });

    // Handle benefits
    await prisma.benefit.deleteMany({ where: { serviceId: record.id } });
    if (Array.isArray(payload.benefits)) {
      for (const benefit of payload.benefits) {
        await prisma.benefit.create({
          data: {
            serviceId: record.id,
            text: benefit.text || '',
          },
        });
      }
    }

    // Handle process steps
    await prisma.processStep.deleteMany({ where: { serviceId: record.id } });
    if (Array.isArray(payload.processSteps)) {
      for (let i = 0; i < payload.processSteps.length; i++) {
        const step = payload.processSteps[i];
        await prisma.processStep.create({
          data: {
            serviceId: record.id,
            title: stringOrNull(step.title),
            description: step.description || '',
            stepNumber: i + 1,
          },
        });
      }
    }

    // Handle FAQ
    await prisma.faq.deleteMany({ where: { serviceId: record.id } });
    if (Array.isArray(payload.faq)) {
      for (const faq of payload.faq) {
        await prisma.faq.create({
          data: {
            serviceId: record.id,
            question: faq.question || '',
            answer: faq.answer || '',
          },
        });
      }
    }

    const result = await prisma.service.findUnique({
      where: { id: record.id },
      include: {
        benefits: true,
        processSteps: { orderBy: { stepNumber: 'asc' } },
        faq: true,
      },
    });

    res.json(result);
  } catch (error) {
    console.error('[service POST]', error.message);
    res.status(500).json({ error: 'service_save_failed' });
  }
});

// Delete service
router.delete('/:id', async (req, res) => {
  try {
    await prisma.benefit.deleteMany({ where: { serviceId: req.params.id } });
    await prisma.processStep.deleteMany({ where: { serviceId: req.params.id } });
    await prisma.faq.deleteMany({ where: { serviceId: req.params.id } });
    await prisma.service.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    console.error('[service DELETE]', error.message);
    res.status(500).json({ error: 'service_delete_failed' });
  }
});

export default router;
