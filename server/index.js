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
import homeRouter from './routes/home.js';
import aboutRouter from './routes/about.js';
import contactRouter from './routes/contact.js';
import newsletterRouter from './routes/newsletter.js';
import settingsRouter from './routes/settings.js';
import clientsRouter from './routes/clients.js';
import bookingsRouter from './routes/bookings.js';
import messagesRouter from './routes/messages.js';
import translationsRouter from './routes/translations.js';
import mediaRouter from './routes/media.js';
import adminUsersRouter from './routes/adminUsers.js';
import analyticsRouter from './routes/analytics.js';
import authRouter from './routes/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
// Serve uploaded media
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads'), {
  maxAge: '7d',
}));
// API routes
app.use('/api/services', servicesRouter);
app.use('/api/home/testimonials', testimonialsRouter);
app.use('/api/team', teamRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/tags', tagsRouter);
app.use('/api/articles', articlesRouter);
app.use('/api/video-categories', videoCategoriesRouter);
app.use('/api/videos', videosRouter);
app.use('/api/home', homeRouter);
app.use('/api/about', aboutRouter);
app.use('/api/contact', contactRouter);
app.use('/api/newsletter', newsletterRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/translations', translationsRouter);
app.use('/api/media', mediaRouter);
app.use('/api/admin-users', adminUsersRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/auth', authRouter);

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
