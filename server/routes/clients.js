import express from 'express';
import prisma from '../prismaClient.js';

const router = express.Router();

// GET /api/clients?status=&search=
router.get('/', async (req, res) => {
  const { status, search } = req.query;
  try {
    const where = {};
    if (status) where.status = String(status).toUpperCase();
    if (search) {
      const q = String(search);
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
      ];
    }
    const clients = await prisma.client.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json(clients);
  } catch (e) {
    res.status(500).json({ error: 'list_failed' });
  }
});

router.post('/', async (req, res) => {
  const { name, email, phone, notes, status } = req.body;
  if (!name) return res.status(400).json({ error: 'missing_name' });
  try {
    const created = await prisma.client.create({ data: { name, email: email || null, phone: phone || null, notes: notes || null, status } });
    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ error: 'create_failed' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, notes, status, lastVisit } = req.body;
  try {
    const updated = await prisma.client.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(notes !== undefined ? { notes } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(lastVisit !== undefined ? { lastVisit: lastVisit ? new Date(lastVisit) : null } : {}),
      },
    });
    res.json(updated);
  } catch (e) {
    res.status(404).json({ error: 'not_found' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.client.delete({ where: { id } });
    res.json({ deleted: id });
  } catch (e) {
    res.status(404).json({ error: 'not_found' });
  }
});

export default router;
