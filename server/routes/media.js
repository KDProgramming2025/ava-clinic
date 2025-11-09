import express from 'express';
import prisma from '../prismaClient.js';
import { authMiddleware } from './auth.js';

const router = express.Router();

// GET /api/media
router.get('/', async (_req, res) => {
  try {
    const items = await prisma.media.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: 'media_list_failed' });
  }
});

// POST /api/media
// Body: { url: string, alt?: string, type?: string, labels?: string[] | any }
router.post('/', authMiddleware(['SUPERADMIN','ADMIN','EDITOR']), async (req, res) => {
  const { url, alt, type, labels } = req.body || {};
  if (!url) return res.status(400).json({ error: 'missing_url' });
  try {
    const created = await prisma.media.create({ data: { url, alt: alt || null, type: type || null, labels: labels ?? null } });
    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ error: 'media_create_failed' });
  }
});

// DELETE /api/media/:id
router.delete('/:id', authMiddleware(['SUPERADMIN','ADMIN','EDITOR']), async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.media.delete({ where: { id } });
    res.json({ deleted: id });
  } catch (e) {
    res.status(404).json({ error: 'not_found' });
  }
});

export default router;
