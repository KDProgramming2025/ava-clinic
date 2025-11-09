import express from 'express';
import prisma from '../prismaClient.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const settings = await prisma.settings.findUnique({ where: { id: 1 } });
    const nav = await prisma.navigationItem.findMany({ orderBy: { order: 'asc' } });
    const footer = await prisma.footerLink.findMany();
    const trending = await prisma.trendingTopic.findMany({ orderBy: { order: 'asc' } });
    res.json({ settings, navigation: nav, footerLinks: footer, trendingTopics: trending });
  } catch (e) {
    res.status(500).json({ error: 'settings_fetch_failed' });
  }
});

router.put('/', async (req, res) => {
  const { settings, navigation, footerLinks, trendingTopics } = req.body;
  try {
    await prisma.$transaction(async (tx) => {
      if (settings) {
        await tx.settings.upsert({
          where: { id: 1 },
          update: settings,
          create: { id: 1, ...settings },
        });
      }
      if (navigation) {
        await tx.navigationItem.deleteMany();
        await tx.navigationItem.createMany({ data: navigation.map((n, idx) => ({ label: n.label, path: n.path, order: n.order ?? idx, visible: n.visible ?? true })) });
      }
      if (footerLinks) {
        await tx.footerLink.deleteMany();
        await tx.footerLink.createMany({ data: footerLinks.map(f => ({ label: f.label, url: f.url, group: f.group || null })) });
      }
      if (trendingTopics) {
        await tx.trendingTopic.deleteMany();
        await tx.trendingTopic.createMany({ data: trendingTopics.map((t, idx) => ({ text: t.text, order: t.order ?? idx })) });
      }
    });
    res.json({ updated: true });
  } catch (e) {
    res.status(500).json({ error: 'settings_update_failed' });
  }
});

export default router;
