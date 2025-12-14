import express from 'express';
import prisma from '../prismaClient.js';

const router = express.Router();

const FALLBACK_BASE = (process.env.SITE_URL || process.env.BASE_URL || 'https://avakasht.ir').replace(/\/$/, '');
const HREFLANGS = ['fa', 'en'];

function absolute(base, path) {
  if (!path) return base;
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}

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

function formatDuration(seconds) {
  if (!seconds || Number.isNaN(Number(seconds))) return undefined;
  const s = Number(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return `PT${h ? `${h}H` : ''}${m ? `${m}M` : ''}${sec ? `${sec}S` : ''}` || undefined;
}

function hreflangTags(loc) {
  return HREFLANGS.map(lang => ({ lang, href: loc }))
    .concat({ lang: 'x-default', href: loc });
}

function withLangParam(loc, lang) {
  const separator = loc.includes('?') ? '&' : '?';
  return `${loc}${separator}l=${lang}`;
}

router.get('/sitemap.xml', async (req, res) => {
  try {
    const base = getBaseUrl(req) || FALLBACK_BASE;
    const [services, articles, videos] = await Promise.all([
      prisma.service.findMany({ select: { slug: true, updatedAt: true, image: true } }),
      prisma.article.findMany({ where: { status: 'PUBLISHED' }, select: { slug: true, updatedAt: true, publishedAt: true, image: true } }),
      prisma.video.findMany({ where: { status: 'PUBLISHED' }, select: { slug: true, updatedAt: true, thumbnail: true, durationSeconds: true, description: true, title: true } }),
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

    const pushLocalized = (loc, meta) => {
      const alternates = hreflangTags(loc).map(a => ({ ...a, href: a.lang === 'x-default' ? loc : withLangParam(loc, a.lang) }));
      HREFLANGS.forEach(lang => {
        urls.push({
          ...meta,
          loc: withLangParam(loc, lang),
          alternates,
        });
      });
    };

    for (const p of staticPaths) {
      const loc = `${base}/${p}`.replace(/\/$/, '/');
      pushLocalized(loc, {
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: '0.6',
      });
    }
    for (const s of services) {
      const loc = `${base}/services/${s.slug}`;
      pushLocalized(loc, {
        lastmod: (s.updatedAt || new Date()).toISOString(),
        changefreq: 'monthly',
        priority: '0.8',
        images: s.image ? [absolute(base, s.image)] : [],
      });
    }
    for (const a of articles) {
      const loc = `${base}/magazine/${a.slug}`;
      pushLocalized(loc, {
        lastmod: (a.updatedAt || a.publishedAt || new Date()).toISOString(),
        changefreq: 'weekly',
        priority: '0.7',
        images: a.image ? [absolute(base, a.image)] : [],
      });
    }
    for (const v of videos) {
      const path = v.slug ? `/videos/${v.slug}` : '/videos';
      const loc = `${base}${path}`;
      pushLocalized(loc, {
        lastmod: (v.updatedAt || new Date()).toISOString(),
        changefreq: 'monthly',
        priority: '0.5',
        images: v.thumbnail ? [absolute(base, v.thumbnail)] : [],
        video: {
          title: v.title,
          description: v.description,
          thumbnail: v.thumbnail ? absolute(base, v.thumbnail) : undefined,
          duration: formatDuration(v.durationSeconds),
        },
      });
    }

    const namespaces = 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1" xmlns:xhtml="http://www.w3.org/1999/xhtml"';
    const body = `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset ${namespaces}>\n` +
      urls.map(u => {
        const imageXml = (u.images || []).map(img => `    <image:image><image:loc>${xmlEscape(img)}</image:loc></image:image>`).join('\n');
          const videoXml = u.video && u.video.thumbnail
            ? `    <video:video>\n      <video:thumbnail_loc>${xmlEscape(u.video.thumbnail)}</video:thumbnail_loc>\n      ${u.video.title ? `<video:title>${xmlEscape(u.video.title)}</video:title>` : ''}\n      ${u.video.description ? `<video:description>${xmlEscape(u.video.description)}</video:description>` : ''}\n      ${u.video.duration ? `<video:duration>${xmlEscape(u.video.duration)}</video:duration>` : ''}\n    </video:video>`
            : '';
          const alternateXml = (u.alternates || []).map(a => `    <xhtml:link rel="alternate" hreflang="${xmlEscape(a.lang)}" href="${xmlEscape(a.href)}" />`).join('\n');
        return `  <url>\n    <loc>${xmlEscape(u.loc)}</loc>\n    <lastmod>${xmlEscape(u.lastmod)}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n${alternateXml ? `    ${alternateXml}\n` : ''}${imageXml ? `${imageXml}\n` : ''}${videoXml ? `${videoXml}\n` : ''}  </url>`;
      }).join('\n') +
      `\n</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(body);
  } catch (e) {
    res.status(500).send('');
  }
});

router.get('/rss.xml', async (req, res) => {
  try {
    const base = getBaseUrl(req) || FALLBACK_BASE;
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
  const base = getBaseUrl(req) || FALLBACK_BASE;
  // Disallow admin panel & uploads raw listing; allow rest
  const body = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/admin\n\nSitemap: ${base}/sitemap.xml\n`;
  res.set('Content-Type', 'text/plain');
  res.send(body);
});

export default router;

// JSON-LD generation endpoint for SPA to inject structured data at runtime
router.get('/api/seo/jsonld', async (req, res) => {
  try {
    const base = getBaseUrl(req) || FALLBACK_BASE;
    const path = String(req.query.path || '/');
    const settings = await prisma.settings.findUnique({ where: { id: 1 } });
    const contactBlocks = await prisma.contactInfoBlock.findMany({ include: { values: true } });
    const socialLinks = await prisma.socialLink.findMany();
    const contactMap = await prisma.contactMap.findUnique({ where: { id: 1 } });
    const contactFaqs = await prisma.contactFaq.findMany({ select: { question: true, answer: true, questionEn: true, questionFa: true, answerEn: true, answerFa: true } });

    const sameAs = socialLinks.map(s => s.url).filter(Boolean);
    const phones = contactBlocks.filter(b => b.type === 'phone').flatMap(b => b.values.map(v => v.value));
    const emails = contactBlocks.filter(b => b.type === 'email').flatMap(b => b.values.map(v => v.value));
    const addresses = contactBlocks.filter(b => b.type === 'address').flatMap(b => b.values.map(v => v.value));

    const logo = settings?.logoUrl ? absolute(base, settings.logoUrl) : `${base}/logo.png`;
    const ogImage = settings?.ogImage ? absolute(base, settings.ogImage) : logo;
    const siteName = settings?.siteTitle || 'Ava Beauty';
    const currentUrl = absolute(base, path || '/');

    const org = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': `${base}#organization`,
      name: siteName,
      url: base,
      logo,
      image: ogImage,
      telephone: phones[0] || undefined,
      email: emails[0] || undefined,
      address: addresses.length ? { '@type': 'PostalAddress', streetAddress: addresses[0] } : undefined,
      sameAs: sameAs.length ? sameAs : undefined,
      geo: contactMap?.latitude && contactMap?.longitude ? { '@type': 'GeoCoordinates', latitude: contactMap.latitude, longitude: contactMap.longitude } : undefined,
      contactPoint: phones.length ? [{ '@type': 'ContactPoint', telephone: phones[0], contactType: 'customer service' }] : undefined,
    };

    const webSite = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteName,
      url: base,
    };

    const webPage = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: siteName,
      url: currentUrl,
    };

    const jsonld = [org, webSite, webPage];

    if (path === '/' || path === '/home') {
      jsonld.push({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: siteName,
        url: base,
        primaryImageOfPage: ogImage,
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
            image: s.image ? absolute(base, s.image) : undefined,
            url: `${base}/services/${s.slug}`,
            provider: { '@id': `${base}#organization` },
          },
        })),
      });
    }

    // Service detail: /services/:slug
    if (path.startsWith('/services/')) {
      const slug = path.split('/').filter(Boolean)[1];
      if (slug) {
        const s = await prisma.service.findUnique({
          where: { slug },
          select: {
            title: true,
            description: true,
            image: true,
            slug: true,
            priceRange: true,
            durationMinutes: true,
            faq: { select: { question: true, answer: true } },
          },
        });
        if (s) {
          const faqEntities = (s.faq || []).map((q, idx) => ({
            '@type': 'Question',
            name: q.question,
            acceptedAnswer: { '@type': 'Answer', text: q.answer },
            position: idx + 1,
          }));

          jsonld.push({
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: s.title,
            description: s.description,
            image: s.image ? absolute(base, s.image) : undefined,
            url: `${base}/services/${s.slug}`,
            provider: { '@id': `${base}#organization` },
            serviceType: s.title,
            offers: s.priceRange ? { '@type': 'Offer', price: s.priceRange, priceCurrency: 'IRR' } : undefined,
            timeRequired: s.durationMinutes ? `PT${s.durationMinutes}M` : undefined,
          });

          if (faqEntities.length) {
            jsonld.push({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faqEntities,
            });
          }

          jsonld.push({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${base}/` },
              { '@type': 'ListItem', position: 2, name: 'Services', item: `${base}/services` },
              { '@type': 'ListItem', position: 3, name: s.title, item: `${base}/services/${s.slug}` },
            ],
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
            image: a.image ? absolute(base, a.image) : undefined,
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
        const a = await prisma.article.findUnique({ where: { slug }, select: { title: true, excerpt: true, image: true, slug: true, publishedAt: true, updatedAt: true, author: { select: { name: true } }, category: { select: { name: true } } } });
        if (a) {
          jsonld.push({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: a.title,
            description: a.excerpt || undefined,
            image: a.image ? absolute(base, a.image) : undefined,
            datePublished: a.publishedAt ? new Date(a.publishedAt).toISOString() : undefined,
            dateModified: a.updatedAt ? new Date(a.updatedAt).toISOString() : undefined,
            url: `${base}/magazine/${a.slug}`,
            author: a.author?.name ? { '@type': 'Person', name: a.author.name } : undefined,
            articleSection: a.category?.name,
            publisher: { '@id': `${base}#organization` },
          });

          jsonld.push({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${base}/` },
              { '@type': 'ListItem', position: 2, name: 'Magazine', item: `${base}/magazine` },
              { '@type': 'ListItem', position: 3, name: a.title, item: `${base}/magazine/${a.slug}` },
            ],
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
            thumbnailUrl: v.thumbnail ? absolute(base, v.thumbnail) : undefined,
            url: v.slug ? `${base}/videos/${v.slug}` : `${base}/videos`,
          },
        })),
      });
    }

    // Video detail: /videos/:slug
    if (path.startsWith('/videos/')) {
      const slug = path.split('/').filter(Boolean)[1];
      if (slug) {
        const v = await prisma.video.findUnique({ where: { slug }, select: { title: true, description: true, thumbnail: true, slug: true, durationSeconds: true, sourceUrl: true, updatedAt: true, createdAt: true, takenAt: true } });
        if (v) {
          jsonld.push({
            '@context': 'https://schema.org',
            '@type': 'VideoObject',
            name: v.title,
            description: v.description || undefined,
            thumbnailUrl: v.thumbnail ? absolute(base, v.thumbnail) : undefined,
            uploadDate: (v.takenAt || v.updatedAt || v.createdAt) ? new Date(v.takenAt || v.updatedAt || v.createdAt).toISOString() : undefined,
            duration: formatDuration(v.durationSeconds),
            contentUrl: v.sourceUrl || undefined,
            embedUrl: v.sourceUrl || undefined,
            url: `${base}/videos/${v.slug}`,
            publisher: { '@id': `${base}#organization` },
          });

          jsonld.push({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${base}/` },
              { '@type': 'ListItem', position: 2, name: 'Videos', item: `${base}/videos` },
              { '@type': 'ListItem', position: 3, name: v.title, item: `${base}/videos/${v.slug}` },
            ],
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

      if (contactFaqs.length) {
        const faqEntities = contactFaqs.map((f, idx) => ({
          '@type': 'Question',
          name: f.questionFa || f.question || f.questionEn,
          acceptedAnswer: { '@type': 'Answer', text: f.answerFa || f.answer || f.answerEn },
          position: idx + 1,
        }));
        jsonld.push({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqEntities,
        });
      }
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
