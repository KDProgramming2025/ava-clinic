import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import fs from 'fs/promises';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import TelegramService from './services/TelegramService.js';
import prisma from './prismaClient.js';
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
// Respect X-Forwarded-* headers from reverse proxy/CDN (needed for rate limiter IP detection)
app.set('trust proxy', 1);
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// --- Social preview helpers ---
const PREVIEW_BOT_REGEX = /(telegram|facebookexternalhit|whatsapp|viber|line|twitterbot|linkedinbot|slackbot|discord|vkshare|pinterest|embedly|quora\slink\spreview|outbrain|yandexbot|bingbot|googlebot|baiduspider)/i;
const DEFAULT_DESCRIPTION = 'Ava Beauty clinic specializes in women\'s hair and eyebrow implants in Tehran with natural-looking results.';
const DEFAULT_DESCRIPTION_FA = 'کلینیک تخصصی کاشت مو و ابرو آوا در تهران با نتایج طبیعی و ماندگار.';

const absoluteUrl = (base, value) => {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  const normalized = value.startsWith('/') ? value : `/${value}`;
  return `${base}${normalized}`;
};

const escapeHtml = (value) => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const firstNonEmpty = (...values) => {
  for (const value of values) {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed) return trimmed;
    }
  }
  return undefined;
};

const currentBaseUrl = (req) => {
  const envUrl = process.env.SITE_URL || process.env.BASE_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.get('host');
  return `${proto}://${host}`;
};

const isPreviewBotRequest = (req) => {
  const ua = (req.get('user-agent') || '').toLowerCase();
  const force = req.query.__preview === '1';
  return force || PREVIEW_BOT_REGEX.test(ua);
};

async function buildMetaForRequest(req, base) {
  const cleanPath = req.path || '/';
  const fullPath = (req.originalUrl || cleanPath).split('#')[0] || cleanPath;
  const langParam = String(req.query?.l || '').toLowerCase();
  const lang = langParam === 'en' ? 'en' : 'fa';

  const [settings, homeHero] = await Promise.all([
    prisma.settings.findUnique({ where: { id: 1 } }),
    cleanPath === '/' ? prisma.homeHero.findUnique({ where: { id: 1 }, select: { imageUrl: true } }) : Promise.resolve(null),
  ]);

  const pickLocalized = (opts) => {
    const { fa, en, neutral } = opts;
    if (lang === 'en') return firstNonEmpty(en, neutral, fa);
    return firstNonEmpty(fa, neutral, en);
  };

  const fallbackTitle = pickLocalized({ fa: settings?.siteTitleFa, en: settings?.siteTitleEn, neutral: settings?.siteTitle }) || 'Ava Beauty';
  let fallbackDescription = pickLocalized({ fa: settings?.metaDescriptionFa, en: settings?.metaDescriptionEn, neutral: settings?.metaDescription })
    || (lang === 'fa' ? DEFAULT_DESCRIPTION_FA : DEFAULT_DESCRIPTION);

  if (lang === 'fa' && (!settings?.metaDescriptionFa || !settings.metaDescriptionFa.trim())) {
    const neutralDesc = settings?.metaDescription?.trim();
    if (neutralDesc && neutralDesc === fallbackDescription) {
      fallbackDescription = DEFAULT_DESCRIPTION_FA;
    }
  }

  if (lang === 'fa' && fallbackDescription && settings?.metaDescriptionFa && settings.metaDescriptionEn && settings.metaDescriptionFa === settings.metaDescriptionEn) {
    // Stored FA text is just the English copy; prefer a Persian default to avoid English preview.
    fallbackDescription = DEFAULT_DESCRIPTION_FA;
  }
  const fallbackImage = absoluteUrl(base, settings?.ogImage)
    || absoluteUrl(base, homeHero?.imageUrl)
    || absoluteUrl(base, settings?.logoUrl)
    || `${base}/logo.png`;

  const meta = {
    title: fallbackTitle,
    description: fallbackDescription,
    image: fallbackImage,
    type: 'website',
    url: `${base}${fullPath}`,
    siteName: fallbackTitle,
  };

  try {
    if (cleanPath.startsWith('/services/')) {
      const slug = cleanPath.split('/').filter(Boolean)[1];
      if (slug) {
        const service = await prisma.service.findUnique({
          where: { slug },
          select: { title: true, titleFa: true, titleEn: true, description: true, descriptionFa: true, descriptionEn: true, image: true },
        });
        if (service) {
          meta.title = pickLocalized({ fa: service.titleFa, en: service.titleEn, neutral: service.title }) || meta.title;
          meta.description = pickLocalized({ fa: service.descriptionFa, en: service.descriptionEn, neutral: service.description }) || meta.description;
          meta.image = absoluteUrl(base, service.image) || meta.image;
          meta.type = 'article';
          meta.url = `${base}/services/${slug}`;
        }
      }
    } else if (cleanPath.startsWith('/magazine/')) {
      const slug = cleanPath.split('/').filter(Boolean)[1];
      if (slug) {
        const article = await prisma.article.findFirst({
          where: { slug, status: 'PUBLISHED' },
          select: {
            title: true,
            titleFa: true,
            titleEn: true,
            excerpt: true,
            description: true,
            descriptionFa: true,
            descriptionEn: true,
            image: true,
          },
        });
        if (article) {
          meta.title = pickLocalized({ fa: article.titleFa, en: article.titleEn, neutral: article.title }) || meta.title;
          meta.description = pickLocalized({ fa: article.descriptionFa, en: article.descriptionEn, neutral: article.excerpt || article.description }) || meta.description;
          meta.image = absoluteUrl(base, article.image) || meta.image;
          meta.type = 'article';
          meta.url = `${base}/magazine/${slug}`;
        }
      }
    } else if (cleanPath.startsWith('/videos/')) {
      const slug = cleanPath.split('/').filter(Boolean)[1];
      if (slug) {
        const video = await prisma.video.findFirst({
          where: { slug, status: 'PUBLISHED' },
          select: { title: true, description: true, thumbnail: true },
        });
        if (video) {
          meta.title = pickLocalized({ neutral: video.title, fa: video.title, en: video.title }) || meta.title;
          meta.description = pickLocalized({ neutral: video.description, fa: video.description, en: video.description }) || meta.description;
          meta.image = absoluteUrl(base, video.thumbnail) || meta.image;
          meta.type = 'video.other';
          meta.url = `${base}/videos/${slug}`;
        }
      }
    }
  } catch (e) {
    // If any lookups fail, fallback meta is still returned.
    console.warn('[seo-meta] lookup failed', e?.message || e);
  }

  return meta;
}

const buildHeadTags = (meta) => {
  const tags = [
    meta.title ? `<title>${escapeHtml(meta.title)}</title>` : null,
    meta.title ? `<meta property="og:title" content="${escapeHtml(meta.title)}" />` : null,
    meta.description ? `<meta name="description" content="${escapeHtml(meta.description)}" />` : null,
    meta.description ? `<meta property="og:description" content="${escapeHtml(meta.description)}" />` : null,
    meta.url ? `<link rel="canonical" href="${escapeHtml(meta.url)}" />` : null,
    meta.url ? `<meta property="og:url" content="${escapeHtml(meta.url)}" />` : null,
    `<meta property="og:type" content="${escapeHtml(meta.type || 'website')}" />`,
    meta.siteName ? `<meta property="og:site_name" content="${escapeHtml(meta.siteName)}" />` : null,
    meta.image ? `<meta property="og:image" content="${escapeHtml(meta.image)}" />` : null,
    meta.image ? `<meta property="og:image:alt" content="${escapeHtml(meta.title || meta.siteName || 'Ava Beauty')}" />` : null,
    '<meta name="twitter:card" content="summary_large_image" />',
    meta.title ? `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />` : null,
    meta.description ? `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />` : null,
    meta.image ? `<meta name="twitter:image" content="${escapeHtml(meta.image)}" />` : null,
    '<meta name="robots" content="index,follow" />',
  ].filter(Boolean);

  return `    ${tags.join('\n    ')}\n`;
};

const injectHeadTags = (html, meta) => {
  const tags = buildHeadTags(meta);
  if (html.includes('</head>')) {
    return html.replace('</head>', `${tags}</head>`);
  }
  return `${tags}${html}`;
};

// --- Security Headers (simple, fast) ---
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
  // CSP allowing Cloudflare Insights beacon
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'none';");
  next();
});

// --- Lightweight observability (errors only) ---
app.use((req, res, next) => {
  res.setHeader('X-Request-Id', `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
  res.on('finish', () => {
    if (res.statusCode >= 500) {
      console.warn(`error/api status=${res.statusCode} method=${req.method} path=${req.originalUrl}`);
    }
  });
  next();
});

// --- Rate limiting ---
const windowMs = Number(process.env.RL_WINDOW_MS || 15 * 60 * 1000);
const maxRequests = Number(process.env.RL_MAX || 200);
const apiLimiter = rateLimit({ windowMs, max: maxRequests, standardHeaders: true, legacyHeaders: false });

// --- Body parsers with sane limits (uploads handled via multer in routes) ---
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

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

// Serve uploaded media
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads'), {
  maxAge: '7d',
}));
// Apply rate limit to API endpoints only (uploads still protected per-route)
app.use('/api', apiLimiter);
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
const indexFile = path.join(buildDir, 'index.html');
let cachedIndexHtml;

app.use(express.static(buildDir, { maxAge: '7d', index: false }));

const getIndexHtml = async () => {
  if (cachedIndexHtml) return cachedIndexHtml;
  cachedIndexHtml = await fs.readFile(indexFile, 'utf-8');
  return cachedIndexHtml;
};

// SPA fallback with server-side OG/Twitter tags for link preview bots (Telegram, etc.)
app.get(/.*/, async (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  if (['/sitemap.xml', '/robots.txt', '/rss.xml'].includes(req.path)) return next();

  try {
    const base = currentBaseUrl(req);
    const html = await getIndexHtml();

    res.set('Content-Type', 'text/html');
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Vary', 'User-Agent');

    if (!isPreviewBotRequest(req)) {
      return res.send(html);
    }

    const meta = await buildMetaForRequest(req, base);
    const withMeta = injectHeadTags(html, meta);
    return res.send(withMeta);
  } catch (e) {
    console.warn('[spa-fallback]', e?.message || e);
    try {
      const html = await getIndexHtml();
      res.set('Content-Type', 'text/html');
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      res.set('Vary', 'User-Agent');
      return res.send(html);
    } catch (err) {
      console.warn('[spa-fallback-read]', err?.message || err);
      return next();
    }
  }
});

const server = httpServer.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[ava-beauty] backend listening on :${port}`);
});
server.setTimeout(300000); // 5 minutes timeout for long imports
