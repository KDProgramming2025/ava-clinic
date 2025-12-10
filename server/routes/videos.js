import express from 'express';
import prisma from '../prismaClient.js';
import { importInstagramPost, deleteVideoMediaFiles } from '../utils/instagramImport.js';

const router = express.Router();

// GET /api/videos?category=
router.get('/', async (req, res) => {
  const { category, status } = req.query;
  try {
    const where = {};
    if (category) where.category = { OR: [{ id: String(category) }, { slug: String(category) }] };
    if (status) {
      const normalized = String(status).toUpperCase();
      if (['DRAFT', 'PUBLISHED'].includes(normalized)) {
        where.status = normalized;
      }
    }
    const items = await prisma.video.findMany({ 
      where, 
      include: { category: true }, 
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    });
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: 'list_failed' });
  }
});

router.put('/reorder', async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) return res.status(400).json({ error: 'invalid_input' });

  try {
    const updates = items.map((item) =>
      prisma.video.update({
        where: { id: item.id },
        data: { sortOrder: item.order },
      })
    );
    await prisma.$transaction(updates);
    res.json({ success: true });
  } catch (e) {
    console.error('[Video Reorder Error]', e);
    res.status(500).json({ error: 'reorder_failed' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const item = await prisma.video.findFirst({ where: { id }, include: { category: true } });
    if (!item) return res.status(404).json({ error: 'not_found' });
    res.json(item);
  } catch (e) {
    res.status(500).json({ error: 'get_failed' });
  }
});

function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function uniqueVideoSlug(base, excludeId) {
  let slug = base;
  let i = 1;
  // Ensure uniqueness
  while (true) {
    const existing = await prisma.video.findUnique({ where: { slug } });
    if (!existing || (excludeId && existing.id === excludeId)) break;
    slug = `${base}-${i++}`;
  }
  return slug;
}

const normalizeStatus = (value) => {
  if (!value || typeof value !== 'string') return undefined;
  const upper = value.toUpperCase();
  if (upper === 'DRAFT' || upper === 'PUBLISHED') return upper;
  return undefined;
};

const normalizeNullable = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }
  return value;
};

router.post('/import', async (req, res) => {
  const { url, status } = req.body || {};
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'missing_url' });
  }
  try {
    const imported = await importInstagramPost(url);
    let finalSlug = slugify(imported.title || imported.shortcode || 'instagram-post');
    if (finalSlug) finalSlug = await uniqueVideoSlug(finalSlug);
    const finalStatus = normalizeStatus(status) || 'DRAFT';
    const created = await prisma.video.create({
      data: {
        title: imported.title,
        slug: finalSlug || null,
        description: imported.caption,
        caption: imported.caption,
        thumbnail: imported.thumbnail,
        durationSeconds: imported.durationSeconds,
        status: finalStatus,
        sourceUrl: imported.normalizedUrl,
        media: imported.media,
        takenAt: imported.takenAt,
        authorUsername: imported.authorUsername,
        authorFullName: imported.authorFullName,
      },
      include: { category: true },
    });
    res.status(201).json(created);
  } catch (error) {
    console.error('[Video Import Error]', error);
    const code = error?.message || 'import_failed';
    const badRequestErrors = ['instagram_invalid_url', 'instagram_invalid_host', 'instagram_unsupported_url', 'instagram_login_required'];
    const statusCode = badRequestErrors.includes(code) ? 400 : 500;
    res.status(statusCode).json({ error: code });
  }
});

router.post('/', async (req, res) => {
  const { title, slug, description, thumbnail, durationSeconds, status, categoryId, sourceUrl, caption, media, takenAt, authorUsername, authorFullName } = req.body || {};
  if (!title) return res.status(400).json({ error: 'missing_title' });
  try {
    let finalSlug = slug ? slugify(slug) : slugify(title);
    if (finalSlug) finalSlug = await uniqueVideoSlug(finalSlug);
    const finalStatus = normalizeStatus(status) || undefined;
    const created = await prisma.video.create({
      data: {
        title,
        slug: finalSlug || null,
        description: normalizeNullable(description),
        caption: normalizeNullable(caption),
        thumbnail: normalizeNullable(thumbnail),
        durationSeconds: durationSeconds ?? null,
        status: finalStatus || 'DRAFT',
        sourceUrl: normalizeNullable(sourceUrl),
        media: media || null,
        takenAt: takenAt ? new Date(takenAt) : null,
        authorUsername: normalizeNullable(authorUsername),
        authorFullName: normalizeNullable(authorFullName),
        category: categoryId ? { connect: { id: categoryId } } : undefined,
      },
      include: { category: true },
    });
    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ error: 'create_failed' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, slug, description, thumbnail, durationSeconds, status, categoryId, sourceUrl, caption, media, takenAt, authorUsername, authorFullName } = req.body || {};
  try {
    let slugUpdate = {};
    if (slug !== undefined) {
      let next = slug ? slugify(slug) : null;
      if (next) next = await uniqueVideoSlug(next, id);
      slugUpdate = { slug: next };
    }
    const updated = await prisma.video.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...slugUpdate,
        ...(description !== undefined ? { description: normalizeNullable(description) } : {}),
        ...(caption !== undefined ? { caption: normalizeNullable(caption) } : {}),
        ...(thumbnail !== undefined ? { thumbnail: normalizeNullable(thumbnail) } : {}),
        ...(durationSeconds !== undefined ? { durationSeconds } : {}),
        ...(status !== undefined ? { status: normalizeStatus(status) || 'DRAFT' } : {}),
        ...(sourceUrl !== undefined ? { sourceUrl: normalizeNullable(sourceUrl) } : {}),
        ...(media !== undefined ? { media } : {}),
        ...(takenAt !== undefined ? { takenAt: takenAt ? new Date(takenAt) : null } : {}),
        ...(authorUsername !== undefined ? { authorUsername: normalizeNullable(authorUsername) } : {}),
        ...(authorFullName !== undefined ? { authorFullName: normalizeNullable(authorFullName) } : {}),
        ...(categoryId !== undefined ? (categoryId ? { category: { connect: { id: categoryId } } } : { category: { disconnect: true } }) : {}),
      },
      include: { category: true },
    });
    res.json(updated);
  } catch (e) {
    res.status(404).json({ error: 'not_found' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await prisma.video.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'not_found' });
    await prisma.video.delete({ where: { id } });
    await deleteVideoMediaFiles(existing);
    res.json({ deleted: id });
  } catch (e) {
    res.status(404).json({ error: 'not_found' });
  }
});

export default router;
