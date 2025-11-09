import express from 'express';
import prisma from '../prismaClient.js';

const router = express.Router();

function getBaseUrl(req) {
  const envUrl = process.env.SITE_URL || process.env.BASE_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');
  const proto = (req.headers['x-forwarded-proto'] || req.protocol || 'http');
  const host = req.get('host');
  return `${proto}://${host}`;
}

function xmlEscape(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

router.get('/sitemap.xml', async (req, res) => {
  try {
    const base = getBaseUrl(req);
    const [services, articles, videos] = await Promise.all([
      prisma.service.findMany({ select: { slug: true, updatedAt: true } }),
      prisma.article.findMany({ where: { status: 'PUBLISHED' }, select: { slug: true, updatedAt: true, publishedAt: true } }),
      prisma.video.findMany({ where: { status: 'PUBLISHED' }, select: { slug: true, updatedAt: true } }),
    ]);

    const staticPaths = [
      '',
      'about',
      'contact',
      'booking',
      'services',
      'magazine',
      'videos'
    ];

    const urls = [];
    for (const p of staticPaths) {
      urls.push({ loc: `${base}/${p}`.replace(/\/$\//, '/'), lastmod: new Date().toISOString(), changefreq: 'weekly', priority: '0.6' });
    }
    for (const s of services) {
      urls.push({ loc: `${base}/services/${s.slug}`, lastmod: (s.updatedAt || new Date()).toISOString(), changefreq: 'monthly', priority: '0.8' });
    }
    for (const a of articles) {
      urls.push({ loc: `${base}/magazine/${a.slug}`, lastmod: (a.updatedAt || a.publishedAt || new Date()).toISOString(), changefreq: 'weekly', priority: '0.7' });
    }
    for (const v of videos) {
      const path = v.slug ? `/videos/${v.slug}` : '/videos';
      urls.push({ loc: `${base}${path}`, lastmod: (v.updatedAt || new Date()).toISOString(), changefreq: 'monthly', priority: '0.5' });
    }

    const body = `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls.map(u => `  <url>\n    <loc>${xmlEscape(u.loc)}</loc>\n    <lastmod>${xmlEscape(u.lastmod)}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`).join('\n') +
      `\n</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(body);
  } catch (e) {
    res.status(500).send('');
  }
});

router.get('/rss.xml', async (req, res) => {
  try {
    const base = getBaseUrl(req);
    const siteTitle = 'Ava Beauty';
    const siteDesc = 'Hair & Eyebrow Implant Clinic';
    const items = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: 50,
      select: { title: true, slug: true, excerpt: true, publishedAt: true, updatedAt: true }
    });
    const now = new Date().toUTCString();
    const body = `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<rss version="2.0">\n` +
      `  <channel>\n` +
      `    <title>${xmlEscape(siteTitle)}</title>\n` +
      `    <link>${xmlEscape(base)}</link>\n` +
      `    <description>${xmlEscape(siteDesc)}</description>\n` +
      `    <lastBuildDate>${xmlEscape(now)}</lastBuildDate>\n` +
      items.map(it => `    <item>\n` +
        `      <title>${xmlEscape(it.title)}</title>\n` +
        `      <link>${xmlEscape(`${base}/magazine/${it.slug}`)}</link>\n` +
        `      <guid isPermaLink="true">${xmlEscape(`${base}/magazine/${it.slug}`)}</guid>\n` +
        `      <pubDate>${xmlEscape(new Date(it.publishedAt || it.updatedAt || new Date()).toUTCString())}</pubDate>\n` +
        (it.excerpt ? `      <description>${xmlEscape(it.excerpt)}</description>\n` : '') +
        `    </item>`).join('\n') +
      `\n  </channel>\n` +
      `</rss>`;

    res.set('Content-Type', 'application/rss+xml');
    res.send(body);
  } catch (e) {
    res.status(500).send('');
  }
});

router.get('/robots.txt', (req, res) => {
  const base = getBaseUrl(req);
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`;
  res.set('Content-Type', 'text/plain');
  res.send(body);
});

export default router;
