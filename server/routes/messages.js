import express from 'express';
import prisma from '../prismaClient.js';
import TelegramService from '../services/TelegramService.js';

const router = express.Router();

// GET /api/messages/history?sessionId=...
router.get('/history', async (req, res) => {
  const { sessionId } = req.query;
  if (!sessionId) return res.status(400).json({ error: 'missing_session_id' });

  try {
    const history = await TelegramService.getSessionHistory(sessionId);
    res.json(history);
  } catch (e) {
    console.error('Failed to fetch message history:', e);
    res.status(500).json({ error: 'fetch_failed' });
  }
});

// GET /api/messages?status=
router.get('/', async (req, res) => {
  const { status } = req.query;
  try {
    const where = {};
    if (status) where.status = String(status).toUpperCase();
    const items = await prisma.message.findMany({ where, orderBy: { receivedAt: 'desc' } });
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: 'list_failed' });
  }
});

// POST /api/messages (public contact form)
router.post('/', async (req, res) => {
  const { fromName, email, phone, subject, body } = req.body;
  if (!fromName || !body) return res.status(400).json({ error: 'missing_fields' });
  try {
    const created = await prisma.message.create({ data: { fromName, email: email || null, phone: phone || null, subject: subject || null, body } });
    
    // Notify via Telegram
    TelegramService.notifyNewMessage(created);
    
    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ error: 'create_failed' });
  }
});

// PUT update message (e.g., status)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { status, starred } = req.body;
  try {
    const updated = await prisma.message.update({ where: { id }, data: { ...(status ? { status } : {}), ...(starred !== undefined ? { starred: !!starred } : {}) } });
    res.json(updated);
  } catch (e) {
    res.status(404).json({ error: 'not_found' });
  }
});

// PATCH star toggle
router.patch('/:id/star', async (req, res) => {
  const { id } = req.params;
  const { starred } = req.body || {};
  if (starred === undefined) return res.status(400).json({ error: 'invalid_payload' });
  try {
    const updated = await prisma.message.update({ where: { id }, data: { starred: !!starred } });
    res.json(updated);
  } catch (e) {
    res.status(404).json({ error: 'not_found' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.message.delete({ where: { id } });
    res.json({ deleted: id });
  } catch (e) {
    res.status(404).json({ error: 'not_found' });
  }
});

export default router;
