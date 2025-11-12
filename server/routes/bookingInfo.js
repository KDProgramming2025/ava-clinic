import express from 'express';
import prisma from '../prismaClient.js';

const router = express.Router();

// Get all booking info cards
router.get('/', async (_req, res) => {
  try {
    const items = await prisma.bookingInfo.findMany({ orderBy: { order: 'asc' } });
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: 'booking_info_fetch_failed' });
  }
});

// Create a card
router.post('/', async (req, res) => {
  const { title, description, icon, order } = req.body || {};
  if (!title || !String(title).trim()) return res.status(400).json({ error: 'missing_title' });
  try {
    const created = await prisma.bookingInfo.create({ data: { title: String(title).trim(), description: description || null, icon: icon || null, order: Number(order) || 0 } });
    res.json(created);
  } catch (e) {
    res.status(500).json({ error: 'booking_info_create_failed' });
  }
});

// Update a card
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, icon, order } = req.body || {};
  try {
    const updated = await prisma.bookingInfo.update({ where: { id }, data: { ...(title !== undefined ? { title } : {}), description: description ?? undefined, icon: icon ?? undefined, ...(order !== undefined ? { order: Number(order) } : {}) } });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: 'booking_info_update_failed' });
  }
});

// Delete a card
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.bookingInfo.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'booking_info_delete_failed' });
  }
});

// Bulk reorder
router.put('/', async (req, res) => {
  // Accept array of { id, order }
  const items = Array.isArray(req.body) ? req.body : [];
  try {
    await prisma.$transaction(items.map((it) => prisma.bookingInfo.update({ where: { id: String(it.id) }, data: { order: Number(it.order) || 0 } })));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'booking_info_reorder_failed' });
  }
});

export default router;
