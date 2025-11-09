import express from 'express';
import prisma from '../prismaClient.js';

const router = express.Router();

// GET /api/articles?category=&tag=&featured=
router.get('/', async (req, res) => {
  const { category, tag, featured } = req.query;
  try {
    const where = {};
    if (featured !== undefined) where.featured = featured === 'true';
    if (category) {
      where.category = { OR: [{ id: String(category) }, { slug: String(category) }] };
    }
    if (tag) {
      where.tags = { some: { OR: [{ id: String(tag) }, { slug: String(tag) }] } };
    }
    const items = await prisma.article.findMany({
      where,
      include: { category: true, author: true, tags: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: 'list_failed' });
  }
});

// GET /api/articles/:id (by id or slug)
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const item = await prisma.article.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: { category: true, author: true, tags: true },
    });
    if (!item) return res.status(404).json({ error: 'not_found' });
    res.json(item);
  } catch (e) {
    res.status(500).json({ error: 'get_failed' });
  }
});

// POST create article
router.post('/', async (req, res) => {
  const { title, slug, excerpt, body, image, readTimeMinutes, status, featured, publishedAt, categoryId, authorId, tagIds } = req.body;
  if (!title || !slug) return res.status(400).json({ error: 'missing_fields' });
  try {
    const created = await prisma.article.create({
      data: {
        title,
        slug,
        excerpt: excerpt || null,
        body: body || null,
        image: image || null,
        readTimeMinutes: readTimeMinutes ?? null,
        status: status || 'DRAFT',
        featured: !!featured,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
        category: categoryId ? { connect: { id: categoryId } } : undefined,
        author: authorId ? { connect: { id: authorId } } : undefined,
        tags: tagIds && tagIds.length ? { connect: tagIds.map((id) => ({ id })) } : undefined,
      },
      include: { category: true, author: true, tags: true },
    });
    res.status(201).json(created);
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'slug_conflict' });
    res.status(500).json({ error: 'create_failed' });
  }
});

// PUT update article
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, slug, excerpt, body, image, readTimeMinutes, status, featured, publishedAt, categoryId, authorId, tagIds } = req.body;
  try {
    const updated = await prisma.article.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(slug !== undefined ? { slug } : {}),
        ...(excerpt !== undefined ? { excerpt } : {}),
        ...(body !== undefined ? { body } : {}),
        ...(image !== undefined ? { image } : {}),
        ...(readTimeMinutes !== undefined ? { readTimeMinutes } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(featured !== undefined ? { featured } : {}),
        ...(publishedAt !== undefined ? { publishedAt: publishedAt ? new Date(publishedAt) : null } : {}),
        ...(categoryId !== undefined ? (categoryId ? { category: { connect: { id: categoryId } } } : { category: { disconnect: true } }) : {}),
        ...(authorId !== undefined ? (authorId ? { author: { connect: { id: authorId } } } : { author: { disconnect: true } }) : {}),
        ...(tagIds !== undefined ? { tags: { set: [], connect: (tagIds || []).map((id) => ({ id })) } } : {}),
      },
      include: { category: true, author: true, tags: true },
    });
    res.json(updated);
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'slug_conflict' });
    res.status(404).json({ error: 'not_found' });
  }
});

// PATCH /api/articles/:id/feature
router.patch('/:id/feature', async (req, res) => {
  const { id } = req.params;
  const { featured } = req.body;
  try {
    const updated = await prisma.article.update({ where: { id }, data: { featured: !!featured } });
    res.json(updated);
  } catch (e) {
    res.status(404).json({ error: 'not_found' });
  }
});

// DELETE article
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.article.delete({ where: { id } });
    res.json({ deleted: id });
  } catch (e) {
    res.status(404).json({ error: 'not_found' });
  }
});

export default router;
