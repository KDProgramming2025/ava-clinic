import express from 'express';
import prisma from '../prismaClient.js';
import { authMiddleware } from './auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import fsp from 'fs/promises';

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
const allowedImageExt = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']);
const allowedVideoExt = new Set(['.mp4', '.webm', '.mov', '.m4v']);
const allowedExt = new Set([...allowedImageExt, ...allowedVideoExt]);
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const mime = (file.mimetype || '').toLowerCase();
    const ext = path.extname(file.originalname || '').toLowerCase();
    const okMime = mime.startsWith('image/') || mime.startsWith('video/');
    const okExt = allowedExt.has(ext);
    if (okMime || okExt) return cb(null, true);
    return cb(new Error('unsupported_file_type'));
  },
});

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
router.post(
  '/upload',
  authMiddleware(['SUPERADMIN','ADMIN','EDITOR']),
  (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (!err) return next();
      if (String(err?.message).includes('unsupported_file_type')) return res.status(400).json({ error: 'unsupported_file_type' });
      if (String(err?.code) === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'file_too_large' });
      return res.status(500).json({ error: 'upload_failed' });
    });
  },
  async (req, res) => {
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
  }
);
// DELETE /api/media/:id
router.delete('/:id', authMiddleware(['SUPERADMIN','ADMIN','EDITOR']), async (req, res) => {
  const { id } = req.params;
  try {
    const record = await prisma.media.findUnique({ where: { id } });
    await prisma.media.delete({ where: { id } });
    if (record?.url && record.url.startsWith('/uploads/')) {
      const filePath = path.resolve(process.cwd(), '.' + record.url);
      // Ensure file is inside uploadDir to avoid path traversal
      if (filePath.startsWith(uploadDir)) {
        try { await fsp.unlink(filePath); } catch {}
      }
    }
    res.json({ deleted: id });
  } catch (e) {
    res.status(404).json({ error: 'not_found' });
  }
});

export default router;
