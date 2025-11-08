import express from 'express';
import prisma from '../prismaClient.js';

const router = express.Router();

// List services (optionally include nested data)
router.get('/', async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      include: { benefits: true, processSteps: true, faq: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(services);
  } catch (e) {
    res.status(500).json({ error: 'list_failed' });
  }
});

// Get single service by id or slug
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const service = await prisma.service.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: { benefits: true, processSteps: true, faq: true },
    });
    if (!service) return res.status(404).json({ error: 'not_found' });
    res.json(service);
  } catch (e) {
    res.status(500).json({ error: 'get_failed' });
  }
});

// Create service with nested arrays
router.post('/', async (req, res) => {
  const { title, subtitle, slug, description, image, priceRange, duration, recovery, benefits, processSteps, faq } = req.body;
  if (!title || !slug || !description) return res.status(400).json({ error: 'missing_fields' });
  try {
    const created = await prisma.service.create({
      data: {
        title,
        subtitle,
        slug,
        description,
        image,
        priceRange,
        duration,
        recovery,
        benefits: { create: (benefits || []).map(b => ({ text: b.text })) },
        processSteps: { create: (processSteps || []).map((s, idx) => ({ stepNumber: s.stepNumber ?? idx + 1, title: s.title, description: s.description })) },
        faq: { create: (faq || []).map(f => ({ question: f.question, answer: f.answer })) },
      },
      include: { benefits: true, processSteps: true, faq: true },
    });
    res.status(201).json(created);
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'slug_conflict' });
    res.status(500).json({ error: 'create_failed' });
  }
});

// Update service and replace nested arrays atomically
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, subtitle, slug, description, image, priceRange, duration, recovery, benefits, processSteps, faq } = req.body;
  try {
    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'not_found' });

    // Use transaction: delete all nested then recreate
    const updated = await prisma.$transaction(async (tx) => {
      await tx.benefit.deleteMany({ where: { serviceId: id } });
      await tx.processStep.deleteMany({ where: { serviceId: id } });
      await tx.faq.deleteMany({ where: { serviceId: id } });
      return tx.service.update({
        where: { id },
        data: {
          title,
          subtitle,
          slug,
          description,
          image,
          priceRange,
          duration,
          recovery,
          benefits: { create: (benefits || []).map(b => ({ text: b.text })) },
          processSteps: { create: (processSteps || []).map((s, idx) => ({ stepNumber: s.stepNumber ?? idx + 1, title: s.title, description: s.description })) },
          faq: { create: (faq || []).map(f => ({ question: f.question, answer: f.answer })) },
        },
        include: { benefits: true, processSteps: true, faq: true },
      });
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
