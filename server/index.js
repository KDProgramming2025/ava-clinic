import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import TelegramService from './services/TelegramService.js';
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
import bookingConfigRouter from './routes/bookingConfig.js';
import bookingInfoRouter from './routes/bookingInfo.js';
import messagesRouter from './routes/messages.js';
import mediaRouter from './routes/media.js';
import adminUsersRouter from './routes/adminUsers.js';
import analyticsRouter from './routes/analytics.js';
import authRouter from './routes/auth.js';
import seoRouter from './routes/seo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Initialize Telegram Service with Socket.io
TelegramService.setSocketIo(io);

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join_session', (sessionId) => {
    if (sessionId) {
      socket.join(`session_${sessionId}`);
      console.log(`Socket ${socket.id} joined session ${sessionId}`);
    }
  });

  socket.on('user_message', (data) => {
    if (data && data.text && data.sessionId) {
      TelegramService.handleUserMessage(data.sessionId, data.text);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
// Serve uploaded media
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads'), {
  maxAge: '7d',
}));
// API routes
app.use('/api/services', servicesRouter);
// Back-compat path kept; also expose a cleaner alias
app.use('/api/home/testimonials', testimonialsRouter);
app.use('/api/testimonials', testimonialsRouter);
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
app.use('/api/booking-config', bookingConfigRouter);
app.use('/api/booking-info', bookingInfoRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/media', mediaRouter);
app.use('/api/admin-users', adminUsersRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/auth', authRouter);
// app.use('/api/instagram', instagramRouter);
// app.use('/api/instagram-widget', instagramWidgetRouter);
app.use('/', seoRouter);

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

// Serve frontend static assets from Vite build output
const buildDir = path.resolve(process.cwd(), 'build');
app.use(express.static(buildDir, { maxAge: '7d', index: false }));

// SPA fallback using regex pattern (avoid path-to-regexp '*' parsing issue in some Node builds)
app.get(/.*/, async (req, res, next) => {
  // Skip API & direct SEO asset endpoints
  if (req.path.startsWith('/api/')) return next();
  if (['/sitemap.xml', '/robots.txt', '/rss.xml'].includes(req.path)) return next();
  try {
    const file = path.join(buildDir, 'index.html');
    const html = await fs.readFile(file, 'utf-8');
    res.set('Content-Type', 'text/html');
    return res.send(html);
  } catch (e) {
    return next();
  }
});

const server = httpServer.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[ava-beauty] backend listening on :${port}`);
});
server.setTimeout(300000); // 5 minutes timeout for long imports
