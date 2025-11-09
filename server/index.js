import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import servicesRouter from './routes/services.js';
import testimonialsRouter from './routes/testimonials.js';
import teamRouter from './routes/team.js';
import categoriesRouter from './routes/categories.js';
import tagsRouter from './routes/tags.js';
import articlesRouter from './routes/articles.js';
import videoCategoriesRouter from './routes/videoCategories.js';
import videosRouter from './routes/videos.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
// API routes
app.use('/api/services', servicesRouter);
app.use('/api/home/testimonials', testimonialsRouter);
app.use('/api/team', teamRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/tags', tagsRouter);
app.use('/api/articles', articlesRouter);
app.use('/api/video-categories', videoCategoriesRouter);
app.use('/api/videos', videosRouter);

// Health endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ava-beauty-backend', time: new Date().toISOString() });
});

// Version endpoint (reads package.json name/version)
app.get('/api/version', async (_req, res) => {
  try {
  // Adjust path: server/ lives under project root/server, so go up one level
  const pkgPath = path.resolve(__dirname, '..', 'package.json');
    const raw = await fs.readFile(pkgPath, 'utf-8');
    const pkg = JSON.parse(raw);
    res.json({ name: pkg.name, version: pkg.version });
  } catch (e) {
    res.status(500).json({ error: 'version_read_failed' });
  }
});

// Placeholder: content endpoints can be added later
app.get('/api/content', (_req, res) => {
  res.json({
    services: [],
    articles: [],
    videos: [],
  });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[ava-beauty] backend listening on :${port}`);
});
