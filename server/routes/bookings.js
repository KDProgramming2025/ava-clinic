import express from 'express';
import prisma from '../prismaClient.js';

const router = express.Router();

// GET /api/bookings?status=&date=
router.get('/', async (req, res) => {
  const { status, date } = req.query;
  try {
    const where = {};
    if (status) where.status = String(status).toUpperCase();
    if (date) {
      const d = new Date(String(date));
      const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
      const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1, 0, 0, 0));
      where.startTime = { gte: start, lt: end };
    }
    const items = await prisma.booking.findMany({
      where,
      include: { client: true, service: true },
      orderBy: { startTime: 'asc' },
    });
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: 'list_failed' });
  }
});

router.post('/', async (req, res) => {
  const { clientId, serviceId, startTime, endTime, status, notes, priceCents } = req.body;
  if (!clientId || !startTime) return res.status(400).json({ error: 'missing_fields' });
  try {
    const created = await prisma.booking.create({
      data: {
        client: { connect: { id: clientId } },
        ...(serviceId ? { service: { connect: { id: serviceId } } } : {}),
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        status: status || 'PENDING',
        notes: notes || null,
        priceCents: priceCents ?? null,
      },
      include: { client: true, service: true },
    });
    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ error: 'create_failed' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { clientId, serviceId, startTime, endTime, status, notes, priceCents } = req.body;
  try {
    const updated = await prisma.booking.update({
      where: { id },
      data: {
        ...(clientId !== undefined ? { client: { connect: { id: clientId } } } : {}),
        ...(serviceId !== undefined ? (serviceId ? { service: { connect: { id: serviceId } } } : { service: { disconnect: true } }) : {}),
        ...(startTime !== undefined ? { startTime: new Date(startTime) } : {}),
        ...(endTime !== undefined ? { endTime: endTime ? new Date(endTime) : null } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(notes !== undefined ? { notes } : {}),
        ...(priceCents !== undefined ? { priceCents } : {}),
      },
      include: { client: true, service: true },
    });
    res.json(updated);
  } catch (e) {
    res.status(404).json({ error: 'not_found' });
  }
});

router.patch('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'missing_status' });
  try {
    const updated = await prisma.booking.update({ where: { id }, data: { status } });
    res.json(updated);
  } catch (e) {
    res.status(404).json({ error: 'not_found' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.booking.delete({ where: { id } });
    res.json({ deleted: id });
  } catch (e) {
    res.status(404).json({ error: 'not_found' });
  }
});

export default router;
