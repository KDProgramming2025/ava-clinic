import express from 'express';
import prisma from '../prismaClient.js';
import { authMiddleware } from './auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || '').toLowerCase();
    cb(null, unique + ext);
  }
});
const upload = multer({ storage });

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
// POST /api/media/upload (multipart) field: file, optional alt, type, labels(json string)
router.post('/upload', authMiddleware(['SUPERADMIN','ADMIN','EDITOR']), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'missing_file' });
    let { alt, type, labels } = req.body || {};
    let labelsJson = null;
    if (labels) {
      try { labelsJson = JSON.parse(labels); } catch { labelsJson = null; }
    }
    const relativePath = '/uploads/' + req.file.filename;
    const created = await prisma.media.create({ data: { url: relativePath, alt: alt || null, type: type || req.file.mimetype || null, labels: labelsJson } });
    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ error: 'upload_failed' });
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
