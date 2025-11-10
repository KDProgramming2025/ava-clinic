import express from 'express';
import prisma from '../prismaClient.js';

const router = express.Router();

const BLOCKED_STATUSES = ['CONFIRMED', 'COMPLETED'];

function isValidDate(d) {
  return d instanceof Date && !isNaN(d.getTime());
}

function normalizeStatus(status) {
  if (!status) return 'PENDING';
  const s = String(status).toUpperCase();
  const allowed = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
  return allowed.includes(s) ? s : null;
}

async function hasOverlap({ idToExclude, clientId, serviceId, startTime, endTime }) {
  // Only check against CONFIRMED/COMPLETED
  // An existing booking overlaps [startTime, endTime) if:
  // existing.startTime < endTime AND existing.endTime > startTime
  // We require endTime for BLOCKED_STATUSES so null endTime shouldn't appear here
  const andClauses = [
    { startTime: { lt: endTime } },
    { endTime: { gt: startTime } },
  ];
  const partyClauses = [{ clientId }];
  if (serviceId) partyClauses.push({ serviceId });
  const where = {
    status: { in: BLOCKED_STATUSES },
    AND: andClauses,
    OR: partyClauses,
    ...(idToExclude ? { NOT: { id: idToExclude } } : {}),
  };
  const conflict = await prisma.booking.findFirst({ where, select: { id: true, clientId: true, serviceId: true, startTime: true, endTime: true, status: true } });
  return conflict;
}

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
    const sTime = new Date(startTime);
    const eTime = endTime ? new Date(endTime) : null;
    if (!isValidDate(sTime)) return res.status(400).json({ error: 'invalid_start_time' });
    if (eTime && !isValidDate(eTime)) return res.status(400).json({ error: 'invalid_end_time' });
    const finalStatus = normalizeStatus(status);
    if (!finalStatus) return res.status(400).json({ error: 'invalid_status' });

    // Validate client/service existence to avoid opaque 500s
    const client = await prisma.client.findUnique({ where: { id: clientId }, select: { id: true } });
    if (!client) return res.status(400).json({ error: 'invalid_client' });
    if (serviceId) {
      const service = await prisma.service.findUnique({ where: { id: serviceId }, select: { id: true } });
      if (!service) return res.status(400).json({ error: 'invalid_service' });
    }

    if (eTime && eTime <= sTime) return res.status(400).json({ error: 'end_time_must_be_after_start' });
    if (BLOCKED_STATUSES.includes(finalStatus)) {
      if (!eTime) return res.status(400).json({ error: 'end_time_required_for_status' });
      const conflict = await hasOverlap({ clientId, serviceId, startTime: sTime, endTime: eTime });
      if (conflict) return res.status(409).json({ error: 'overlap_conflict', conflict });
    }
    const created = await prisma.booking.create({
      data: {
        client: { connect: { id: clientId } },
        ...(serviceId ? { service: { connect: { id: serviceId } } } : {}),
        startTime: sTime,
        endTime: eTime,
        status: finalStatus,
        notes: notes || null,
        priceCents: priceCents ?? null,
      },
      include: { client: true, service: true },
    });
    res.status(201).json(created);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[bookings.post] create_failed', { body: req.body, err: { message: e.message, code: e.code } });
    res.status(500).json({ error: 'create_failed', code: e.code });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { clientId, serviceId, startTime, endTime, status, notes, priceCents } = req.body;
  try {
    // Fetch existing to compute effective values
    const existing = await prisma.booking.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'not_found' });
    const effClientId = clientId ?? existing.clientId;
    const effServiceId = serviceId === undefined ? existing.serviceId : serviceId || null;
    const effStart = startTime ? new Date(startTime) : existing.startTime;
    const effEnd = endTime !== undefined ? (endTime ? new Date(endTime) : null) : existing.endTime;
    const effStatus = normalizeStatus(status ?? existing.status);
    if (!effStatus) return res.status(400).json({ error: 'invalid_status' });
    if (!isValidDate(effStart) || (effEnd && !isValidDate(effEnd))) return res.status(400).json({ error: 'invalid_time' });
    if (effEnd && effEnd <= effStart) return res.status(400).json({ error: 'end_time_must_be_after_start' });
    // Validate referenced entities if changed
    if (clientId !== undefined) {
      const client = await prisma.client.findUnique({ where: { id: effClientId }, select: { id: true } });
      if (!client) return res.status(400).json({ error: 'invalid_client' });
    }
    if (serviceId !== undefined && effServiceId) {
      const service = await prisma.service.findUnique({ where: { id: effServiceId }, select: { id: true } });
      if (!service) return res.status(400).json({ error: 'invalid_service' });
    }
    if (BLOCKED_STATUSES.includes(effStatus)) {
      if (!effEnd) return res.status(400).json({ error: 'end_time_required_for_status' });
      const conflict = await hasOverlap({ idToExclude: id, clientId: effClientId, serviceId: effServiceId, startTime: effStart, endTime: effEnd });
      if (conflict) return res.status(409).json({ error: 'overlap_conflict', conflict });
    }
    const updated = await prisma.booking.update({
      where: { id },
      data: {
        ...(clientId !== undefined ? { client: { connect: { id: clientId } } } : {}),
        ...(serviceId !== undefined ? (serviceId ? { service: { connect: { id: serviceId } } } : { service: { disconnect: true } }) : {}),
        ...(startTime !== undefined ? { startTime: effStart } : {}),
        ...(endTime !== undefined ? { endTime: effEnd } : {}),
        ...(status !== undefined ? { status: effStatus } : {}),
        ...(notes !== undefined ? { notes } : {}),
        ...(priceCents !== undefined ? { priceCents } : {}),
      },
      include: { client: true, service: true },
    });
    res.json(updated);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[bookings.put] update_failed', { params: req.params, body: req.body, err: { message: e.message, code: e.code } });
    res.status(500).json({ error: 'update_failed', code: e.code });
  }
});

router.patch('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'missing_status' });
  try {
    const existing = await prisma.booking.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'not_found' });
    const nextStatus = normalizeStatus(status);
    if (!nextStatus) return res.status(400).json({ error: 'invalid_status' });
    if (BLOCKED_STATUSES.includes(nextStatus)) {
      const startTime = existing.startTime;
      const endTime = existing.endTime;
      if (!endTime) return res.status(400).json({ error: 'end_time_required_for_status' });
      const conflict = await hasOverlap({ idToExclude: id, clientId: existing.clientId, serviceId: existing.serviceId, startTime, endTime });
      if (conflict) return res.status(409).json({ error: 'overlap_conflict', conflict });
    }
    const updated = await prisma.booking.update({ where: { id }, data: { status: nextStatus } });
    res.json(updated);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[bookings.patchStatus] update_failed', { params: req.params, body: req.body, err: { message: e.message, code: e.code } });
    res.status(500).json({ error: 'update_failed', code: e.code });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.booking.delete({ where: { id } });
    res.json({ deleted: id });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[bookings.delete] delete_failed', { params: req.params, err: { message: e.message, code: e.code } });
    res.status(404).json({ error: 'not_found' });
  }
});

export default router;
