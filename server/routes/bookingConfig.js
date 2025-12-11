import express from 'express';
import prisma from '../prismaClient.js';

const router = express.Router();

// GET booking flow configuration
router.get('/', async (_req, res) => {
  try {
    const cfg = await prisma.bookingSettings.findUnique({ where: { id: 1 } });
    res.json(cfg || {});
  } catch (e) {
    res.status(500).json({ error: 'booking_config_fetch_failed' });
  }
});

// PUT booking flow configuration
router.put('/', async (req, res) => {
  const { timeSlots, blackoutDates, disclaimer, disclaimerEn, disclaimerFa, bufferMinutes, defaultDurationMinutes, businessHours } = req.body || {};
  try {
    const updated = await prisma.bookingSettings.upsert({
      where: { id: 1 },
      update: { timeSlots, blackoutDates, disclaimer, disclaimerEn, disclaimerFa, bufferMinutes, defaultDurationMinutes, businessHours },
      create: { id: 1, timeSlots, blackoutDates, disclaimer, disclaimerEn, disclaimerFa, bufferMinutes, defaultDurationMinutes, businessHours },
    });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: 'booking_config_update_failed' });
  }
});

// GET availability for a given date (YYYY-MM-DD) and optional serviceId
router.get('/availability', async (req, res) => {
  const { date, serviceId } = req.query;
  if (!date) return res.status(400).json({ error: 'missing_date' });
  try {
    const cfg = await prisma.bookingSettings.findUnique({ where: { id: 1 } });
    const slots = Array.isArray(cfg?.timeSlots) ? cfg.timeSlots : [];
    const blackout = Array.isArray(cfg?.blackoutDates) ? new Set(cfg.blackoutDates) : new Set();
    // Use per-service duration when available
    let durationMin = cfg?.defaultDurationMinutes ?? 60;
    if (serviceId) {
      const svc = await prisma.service.findUnique({ where: { id: String(serviceId) }, select: { durationMinutes: true } });
      if (svc?.durationMinutes && Number.isFinite(svc.durationMinutes)) {
        durationMin = svc.durationMinutes;
      }
    }
    const bufferMin = cfg?.bufferMinutes ?? 0;

    // If date is blacked out, return empty
    if (blackout.has(String(date))) return res.json([]);

    // Fetch existing bookings for that date with blocking statuses
    const day = new Date(String(date) + 'T00:00:00.000Z');
    const start = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), 0, 0, 0));
    const end = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate() + 1, 0, 0, 0));

    const bookings = await prisma.booking.findMany({
      where: {
        startTime: { gte: start, lt: end },
        status: { in: ['CONFIRMED', 'COMPLETED'] },
        ...(serviceId ? { serviceId: String(serviceId) } : {}),
      },
      select: { startTime: true, endTime: true },
    });

    function overlaps(slotStart, slotEnd) {
      return bookings.some(b => {
        const s = new Date(b.startTime).getTime();
        const e = b.endTime ? new Date(b.endTime).getTime() : s + durationMin * 60_000;
        return s < slotEnd && e > slotStart;
      });
    }

    // Compute available slots by excluding overlaps and applying buffer
    const available = [];
    for (const t of slots) {
      // Expect HH:MM 24h format strings
      const [hh, mm] = String(t).split(':').map(Number);
      if (Number.isNaN(hh) || Number.isNaN(mm)) continue;
      const slotStart = Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), hh, mm, 0);
      const slotEnd = slotStart + (durationMin + bufferMin) * 60_000;
      if (!overlaps(slotStart, slotEnd)) available.push(String(t));
    }

    res.json(available);
  } catch (e) {
    res.status(500).json({ error: 'availability_failed' });
  }
});

export default router;
