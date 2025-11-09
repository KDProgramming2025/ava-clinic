import express from 'express';
import prisma from '../prismaClient.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const newsletter = await prisma.newsletter.findUnique({ where: { id: 1 } });
    res.json(newsletter || {});
  } catch (e) {
    res.status(500).json({ error: 'newsletter_fetch_failed' });
  }
});

router.put('/', async (req, res) => {
  const { headline, description, buttonLabel } = req.body;
  try {
    const updated = await prisma.newsletter.upsert({
      where: { id: 1 },
      update: { headline, description, buttonLabel },
      create: { id: 1, headline, description, buttonLabel },
    });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: 'newsletter_update_failed' });
  }
});

export default router;
