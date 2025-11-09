import express from 'express';
import prisma from '../prismaClient.js';

const router = express.Router();

const slugify = (s) => s.toString().toLowerCase().trim()
  .replace(/[\s\_]+/g, '-')
  .replace(/[^a-z0-9\-]/g, '')
  .replace(/\-+/g, '-')
  .replace(/^\-+|\-+$/g, '');

router.get('/', async (_req, res) => {
  try {
    const items = await prisma.tag.findMany({ orderBy: { name: 'asc' } });
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: 'list_failed' });
  }
});

router.post('/', async (req, res) => {
  const { name, slug } = req.body;
  if (!name) return res.status(400).json({ error: 'missing_name' });
  const s = slug && slug.length ? slug : slugify(name);
  try {
    const created = await prisma.tag.create({ data: { name, slug: s } });
    res.status(201).json(created);
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'slug_conflict' });
    res.status(500).json({ error: 'create_failed' });
  }
});

export default router;
