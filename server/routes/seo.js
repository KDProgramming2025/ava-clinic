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
  // Disallow admin panel & uploads raw listing; allow rest
  const body = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/admin\n\nSitemap: ${base}/sitemap.xml\n`;
  res.set('Content-Type', 'text/plain');
  res.send(body);
});

export default router;

// JSON-LD generation endpoint for SPA to inject structured data at runtime
router.get('/api/seo/jsonld', async (req, res) => {
  try {
    const base = getBaseUrl(req);
    const path = String(req.query.path || '/');
    const settings = await prisma.settings.findUnique({ where: { id: 1 } });
    const contactBlocks = await prisma.contactInfoBlock.findMany({ include: { values: true } });
    const socialLinks = await prisma.socialLink.findMany();

    const sameAs = socialLinks.map(s => s.url).filter(Boolean);
    const phones = contactBlocks.filter(b => b.type === 'phone').flatMap(b => b.values.map(v => v.value));
    const emails = contactBlocks.filter(b => b.type === 'email').flatMap(b => b.values.map(v => v.value));
    const addresses = contactBlocks.filter(b => b.type === 'address').flatMap(b => b.values.map(v => v.value));

    const org = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: settings?.siteTitle || 'Ava Beauty',
      url: base,
      logo: settings?.logoUrl || undefined,
      image: settings?.ogImage || undefined,
      telephone: phones[0] || undefined,
      email: emails[0] || undefined,
      address: addresses.length ? { '@type': 'PostalAddress', streetAddress: addresses[0] } : undefined,
      sameAs: sameAs.length ? sameAs : undefined,
    };

    const jsonld = [org];

    if (path === '/' || path === '/home') {
      jsonld.push({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: settings?.siteTitle || 'Ava Beauty',
        url: base,
      });
    }

    if (path === '/services') {
      const services = await prisma.service.findMany({ select: { title: true, description: true, image: true, slug: true } });
      jsonld.push({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: services.map((s, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'Service',
            name: s.title,
            description: s.description,
            image: s.image || undefined,
            url: `${base}/services/${s.slug}`,
          },
        })),
      });
    }

    // Service detail: /services/:slug
    if (path.startsWith('/services/')) {
      const slug = path.split('/').filter(Boolean)[1];
      if (slug) {
        const s = await prisma.service.findUnique({ where: { slug }, select: { title: true, description: true, image: true, slug: true, priceRange: true, duration: true } });
        if (s) {
          jsonld.push({
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: s.title,
            description: s.description,
            image: s.image || undefined,
            url: `${base}/services/${s.slug}`,
            offers: s.priceRange ? { '@type': 'Offer', price: s.priceRange } : undefined,
          });
        }
      }
    }

    if (path === '/magazine') {
      const articles = await prisma.article.findMany({ where: { status: 'PUBLISHED' }, orderBy: { publishedAt: 'desc' }, take: 25, select: { title: true, excerpt: true, image: true, slug: true, publishedAt: true } });
      jsonld.push({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: articles.map((a, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'BlogPosting',
            headline: a.title,
            description: a.excerpt || undefined,
            image: a.image || undefined,
            datePublished: a.publishedAt ? new Date(a.publishedAt).toISOString() : undefined,
            url: `${base}/magazine/${a.slug}`,
          },
        })),
      });
    }

    // Article detail: /magazine/:slug
    if (path.startsWith('/magazine/')) {
      const slug = path.split('/').filter(Boolean)[1];
      if (slug) {
        const a = await prisma.article.findUnique({ where: { slug }, select: { title: true, excerpt: true, image: true, slug: true, publishedAt: true } });
        if (a) {
          jsonld.push({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: a.title,
            description: a.excerpt || undefined,
            image: a.image || undefined,
            datePublished: a.publishedAt ? new Date(a.publishedAt).toISOString() : undefined,
            url: `${base}/magazine/${a.slug}`,
          });
        }
      }
    }

    if (path === '/videos' || path === '/video-gallery') {
      const videos = await prisma.video.findMany({ where: { status: 'PUBLISHED' }, orderBy: { updatedAt: 'desc' }, take: 25, select: { title: true, description: true, thumbnail: true, slug: true } });
      jsonld.push({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: videos.map((v, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'VideoObject',
            name: v.title,
            description: v.description || undefined,
            thumbnailUrl: v.thumbnail || undefined,
            url: v.slug ? `${base}/videos/${v.slug}` : `${base}/videos`,
          },
        })),
      });
    }

    // Video detail: /videos/:slug
    if (path.startsWith('/videos/')) {
      const slug = path.split('/').filter(Boolean)[1];
      if (slug) {
        const v = await prisma.video.findUnique({ where: { slug }, select: { title: true, description: true, thumbnail: true, slug: true } });
        if (v) {
          jsonld.push({
            '@context': 'https://schema.org',
            '@type': 'VideoObject',
            name: v.title,
            description: v.description || undefined,
            thumbnailUrl: v.thumbnail || undefined,
            url: `${base}/videos/${v.slug}`,
          });
        }
      }
    }

    if (path === '/contact') {
      jsonld.push({
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: settings?.siteTitle ? `${settings.siteTitle} Contact` : 'Contact',
        url: `${base}/contact`,
      });
    }

    if (path === '/about') {
      jsonld.push({
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: settings?.siteTitle ? `${settings.siteTitle} About` : 'About Us',
        url: `${base}/about`,
        description: settings?.metaDescription || undefined,
      });
    }

    res.json(jsonld.filter(Boolean));
  } catch (e) {
    res.status(500).json([]);
  }
});
