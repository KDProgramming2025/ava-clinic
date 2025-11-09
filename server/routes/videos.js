import express from 'express';
import prisma from '../prismaClient.js';

const router = express.Router();

// GET /api/videos?category=
router.get('/', async (req, res) => {
  const { category } = req.query;
  try {
    const where = {};
    if (category) where.category = { OR: [{ id: String(category) }, { slug: String(category) }] };
    const items = await prisma.video.findMany({ where, include: { category: true }, orderBy: { createdAt: 'desc' } });
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: 'list_failed' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const item = await prisma.video.findFirst({ where: { id }, include: { category: true } });
    if (!item) return res.status(404).json({ error: 'not_found' });
    res.json(item);
  } catch (e) {
    res.status(500).json({ error: 'get_failed' });
  }
});

router.post('/', async (req, res) => {
  const { title, description, thumbnail, durationSeconds, status, categoryId } = req.body;
  if (!title) return res.status(400).json({ error: 'missing_title' });
  try {
    const created = await prisma.video.create({
      data: {
        title,
        description: description || null,
        thumbnail: thumbnail || null,
        durationSeconds: durationSeconds ?? null,
        status: status || 'DRAFT',
        category: categoryId ? { connect: { id: categoryId } } : undefined,
      },
      include: { category: true },
    });
    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ error: 'create_failed' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, thumbnail, durationSeconds, status, categoryId } = req.body;
  try {
    const updated = await prisma.video.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(thumbnail !== undefined ? { thumbnail } : {}),
        ...(durationSeconds !== undefined ? { durationSeconds } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(categoryId !== undefined ? (categoryId ? { category: { connect: { id: categoryId } } } : { category: { disconnect: true } }) : {}),
      },
      include: { category: true },
    });
    res.json(updated);
  } catch (e) {
    res.status(404).json({ error: 'not_found' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.video.delete({ where: { id } });
    res.json({ deleted: id });
  } catch (e) {
    res.status(404).json({ error: 'not_found' });
  }
});

export default router;
