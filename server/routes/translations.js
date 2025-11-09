import express from 'express';
import prisma from '../prismaClient.js';

const router = express.Router();

// GET all translations
router.get('/', async (_req, res) => {
  try {
    const items = await prisma.translation.findMany();
    // Flatten for convenience: { key: { ...data } }
    const map = {};
    for (const t of items) map[t.key] = t.data;
    res.json(map);
  } catch (e) {
    res.status(500).json({ error: 'translations_fetch_failed' });
  }
});

// PUT bulk update: expects body as object map { key: { lang: value, ... }, ... }
router.put('/', async (req, res) => {
  const payload = req.body;
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return res.status(400).json({ error: 'invalid_payload' });
  try {
    await prisma.$transaction(async (tx) => {
      for (const key of Object.keys(payload)) {
        await tx.translation.upsert({
          where: { key },
          update: { data: payload[key] },
          create: { key, data: payload[key] },
        });
      }
    });
    res.json({ updated: true });
  } catch (e) {
    res.status(500).json({ error: 'translations_update_failed' });
  }
});

// PATCH single key: /api/translations/:key
router.patch('/:key', async (req, res) => {
  const { key } = req.params;
  const data = req.body;
  if (!data || typeof data !== 'object') return res.status(400).json({ error: 'invalid_payload' });
  try {
    const updated = await prisma.translation.upsert({
      where: { key },
      update: { data },
      create: { key, data },
    });
    res.json({ [key]: updated.data });
  } catch (e) {
    res.status(500).json({ error: 'translation_patch_failed' });
  }
});

export default router;
