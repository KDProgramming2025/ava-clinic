import express from 'express';
import prisma from '../prismaClient.js';
import multer from 'multer';
import mammoth from 'mammoth';
import path from 'path';
import fs from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';

const router = express.Router();

// Ensure uploads/articles directory exists
const articlesUploadDir = path.resolve(process.cwd(), 'uploads', 'articles');
if (!existsSync(articlesUploadDir)) mkdirSync(articlesUploadDir, { recursive: true });

// Configure multer for docx
const tempUploadDir = path.resolve(process.cwd(), 'uploads', 'temp');
if (!existsSync(tempUploadDir)) mkdirSync(tempUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, tempUploadDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + '.docx');
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
        file.originalname.toLowerCase().endsWith('.docx')) {
      return cb(null, true);
    }
    cb(new Error('only_docx_allowed'));
  }
});

const imageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.resolve(process.cwd(), 'uploads', 'articles', 'images');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + ext);
  }
});

const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      return cb(null, true);
    }
    cb(new Error('only_images_allowed'));
  }
});

// POST /api/articles/upload-image
router.post('/upload-image', uploadImage.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'no_file' });
  const url = `/uploads/articles/images/${req.file.filename}`;
  res.json({ url });
});

// POST /api/articles/upload-content
router.post('/upload-content', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'no_file' });
  
  try {
    const filePath = req.file.path;
    const result = await mammoth.convertToHtml({ path: filePath });
    const html = result.value; // The generated HTML
    const messages = result.messages; // Any warnings

    // Create a unique directory for this article content
    const uniqueId = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const contentDirName = `content-${uniqueId}`;
    const contentDirPath = path.join(articlesUploadDir, contentDirName);
    await fs.mkdir(contentDirPath, { recursive: true });

    // Wrap HTML with some basic CSS for better presentation
    const fullHtml = `
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  /* Scoped Styles */
  .article-content { 
    font-family: 'Vazirmatn', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
    line-height: 1.8; 
    color: #1f2937; 
    max-width: 100%; 
  }
  
  /* Typography */
  .article-content h1, .article-content h2, .article-content h3, .article-content h4, .article-content h5, .article-content h6 { 
    color: #111827; 
    margin-top: 2em; 
    margin-bottom: 0.75em; 
    font-weight: 700;
    line-height: 1.3;
  }
  .article-content h1 { font-size: 2.25em; }
  .article-content h2 { font-size: 1.875em; border-bottom: 2px solid #f3f4f6; padding-bottom: 0.5em; }
  .article-content h3 { font-size: 1.5em; }
  
  .article-content p { margin-bottom: 1.5em; text-align: justify; }
  
  /* Links */
  .article-content a { color: #db2777; text-decoration: none; border-bottom: 1px solid transparent; transition: border-color 0.2s; }
  .article-content a:hover { border-bottom-color: #db2777; }
  
  /* Lists */
  .article-content ul, .article-content ol { margin-bottom: 1.5em; padding-right: 1.5em; }
  .article-content li { margin-bottom: 0.5em; }
  
  /* Images */
  .article-content img { 
    max-width: 100%; 
    height: auto; 
    border-radius: 12px; 
    margin: 2em auto; 
    display: block; 
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  
  /* Tables */
  .article-content table { 
    border-collapse: collapse; 
    width: 100%; 
    margin: 2em 0; 
    font-size: 0.95em;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  }
  .article-content thead { background-color: #f9fafb; }
  .article-content th { font-weight: 600; text-align: right; color: #374151; }
  .article-content td, .article-content th { border: 1px solid #e5e7eb; padding: 12px 16px; }
  .article-content tr:nth-child(even) { background-color: #f9fafb; }
  
  /* Quotes */
  .article-content blockquote { 
    border-right: 4px solid #db2777; 
    margin: 2em 0; 
    padding: 1em 1.5em 1em 1em; 
    background-color: #fdf2f8;
    border-radius: 8px;
    color: #4b5563;
    font-style: italic;
  }
  
  /* Code */
  .article-content pre, .article-content code { 
    font-family: 'Fira Code', monospace; 
    background-color: #f3f4f6; 
    border-radius: 4px; 
    font-size: 0.9em;
  }
  .article-content pre { padding: 1em; overflow-x: auto; }
  .article-content code { padding: 0.2em 0.4em; color: #db2777; }
</style>
</head>
<body>
<div class="article-content">
${html}
</div>
</body>
</html>`;

    const indexPath = path.join(contentDirPath, 'index.html');
    await fs.writeFile(indexPath, fullHtml, 'utf-8');

    // Delete the uploaded docx
    await fs.unlink(filePath);

    // Return the URL
    const contentUrl = `/uploads/articles/${contentDirName}/index.html`;
    res.json({ contentUrl, messages });
  } catch (e) {
    console.error(e);
    // Try to cleanup temp file
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    res.status(500).json({ error: 'conversion_failed' });
  }
});

// GET /api/articles?category=&tag=&featured=
router.get('/', async (req, res) => {
  const { category, tag, featured } = req.query;
  try {
    const where = {};
    if (featured !== undefined) where.featured = featured === 'true';
    if (category) {
      where.category = { OR: [{ id: String(category) }, { slug: String(category) }] };
    }
    if (tag) {
      where.tags = { some: { OR: [{ id: String(tag) }, { slug: String(tag) }] } };
    }
    const items = await prisma.article.findMany({
      where,
      include: { category: true, author: true, tags: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: 'list_failed' });
  }
});

// GET /api/articles/:id (by id or slug)
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const item = await prisma.article.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: { category: true, author: true, tags: true },
    });
    if (!item) return res.status(404).json({ error: 'not_found' });
    res.json(item);
  } catch (e) {
    res.status(500).json({ error: 'get_failed' });
  }
});

// POST create article
router.post('/', async (req, res) => {
  const { title, slug, excerpt, body, image, readTimeMinutes, status, featured, publishedAt, categoryId, authorId, tagIds, contentUrl } = req.body;
  if (!title || !slug) return res.status(400).json({ error: 'missing_fields' });
  try {
    const created = await prisma.article.create({
      data: {
        title,
        slug,
        excerpt: excerpt || null,
        body: body || null,
        image: image || null,
        contentUrl: contentUrl || null,
        readTimeMinutes: readTimeMinutes ?? null,
        status: status || 'DRAFT',
        featured: !!featured,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
        category: categoryId ? { connect: { id: categoryId } } : undefined,
        author: authorId ? { connect: { id: authorId } } : undefined,
        tags: tagIds && tagIds.length ? { connect: tagIds.map((id) => ({ id })) } : undefined,
      },
      include: { category: true, author: true, tags: true },
    });
    res.status(201).json(created);
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'slug_conflict' });
    res.status(500).json({ error: 'create_failed' });
  }
});

// PUT update article
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, slug, excerpt, body, image, readTimeMinutes, status, featured, publishedAt, categoryId, authorId, tagIds, contentUrl } = req.body;
  try {
    const updated = await prisma.article.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(slug !== undefined ? { slug } : {}),
        ...(excerpt !== undefined ? { excerpt } : {}),
        ...(body !== undefined ? { body } : {}),
        ...(image !== undefined ? { image } : {}),
        ...(contentUrl !== undefined ? { contentUrl } : {}),
        ...(readTimeMinutes !== undefined ? { readTimeMinutes } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(featured !== undefined ? { featured } : {}),
        ...(publishedAt !== undefined ? { publishedAt: publishedAt ? new Date(publishedAt) : null } : {}),
        ...(categoryId !== undefined ? (categoryId ? { category: { connect: { id: categoryId } } } : { category: { disconnect: true } }) : {}),
        ...(authorId !== undefined ? (authorId ? { author: { connect: { id: authorId } } } : { author: { disconnect: true } }) : {}),
        ...(tagIds !== undefined ? { tags: { set: [], connect: (tagIds || []).map((id) => ({ id })) } } : {}),
      },
      include: { category: true, author: true, tags: true },
    });
    res.json(updated);
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'slug_conflict' });
    res.status(404).json({ error: 'not_found' });
  }
});

// PATCH /api/articles/:id/feature
router.patch('/:id/feature', async (req, res) => {
  const { id } = req.params;
  const { featured } = req.body;
  try {
    const updated = await prisma.article.update({ where: { id }, data: { featured: !!featured } });
    res.json(updated);
  } catch (e) {
    res.status(404).json({ error: 'not_found' });
  }
});

// DELETE article
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) return res.status(404).json({ error: 'not_found' });

    // Delete content directory if exists
    if (article.contentUrl) {
      // contentUrl format: /uploads/articles/content-123456/index.html
      // We want to delete /var/www/ava-beauty/uploads/articles/content-123456
      const relativePath = article.contentUrl.replace('/uploads/articles/', '');
      const dirName = relativePath.split('/')[0];
      if (dirName && dirName.startsWith('content-')) {
        const dirPath = path.join(articlesUploadDir, dirName);
        await fs.rm(dirPath, { recursive: true, force: true }).catch(console.error);
      }
    }

    // Delete image if exists
    if (article.image && article.image.startsWith('/uploads/articles/images/')) {
      const imageName = path.basename(article.image);
      const imagePath = path.join(articlesUploadDir, 'images', imageName);
      await fs.unlink(imagePath).catch(console.error);
    }

    await prisma.article.delete({ where: { id } });
    res.json({ deleted: id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'delete_failed' });
  }
});

export default router;
