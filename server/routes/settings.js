import express from 'express';
import prisma from '../prismaClient.js';
import TelegramService from '../services/TelegramService.js';

const router = express.Router();

const normalizeString = (value) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

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
        // Derive canonical siteTitle/metaDescription from bilingual fields when provided
        const siteTitle = settings.siteTitle ?? settings.siteTitleFa ?? settings.siteTitleEn;
        const metaDescription = settings.metaDescription ?? settings.metaDescriptionFa ?? settings.metaDescriptionEn;
        const settingsPayload = {
          ...settings,
          siteTitle,
          metaDescription,
        };
        await tx.settings.upsert({
          where: { id: 1 },
          update: settingsPayload,
          create: { id: 1, ...settingsPayload },
        });
        
        // Reload Telegram service if settings changed
        if (settings.telegramBotToken !== undefined) {
          TelegramService.reload();
        }
      }
      if (navigation) {
        await tx.navigationItem.deleteMany();
        const navPayload = navigation.map((n, idx) => {
          const labelEn = normalizeString(n.labelEn ?? n.label_en);
          const labelFa = normalizeString(n.labelFa ?? n.label_fa);
          const fallbackLabel = (() => {
            const pathValue = normalizeString(n.path);
            if (!pathValue || pathValue === '/' || pathValue === '#') return 'Link';
            return pathValue.replace(/^\/+/, '') || 'Link';
          })();
          const canonicalLabel = normalizeString(n.label) || labelFa || labelEn || fallbackLabel;
          return {
            label: canonicalLabel,
            labelEn,
            labelFa,
            path: normalizeString(n.path) || '/',
            order: n.order ?? idx,
            visible: n.visible ?? true,
          };
        });
        await tx.navigationItem.createMany({ data: navPayload });
      }
      if (footerLinks) {
        await tx.footerLink.deleteMany();
        const footerPayload = footerLinks.map((f) => {
          const labelEn = normalizeString(f.labelEn ?? f.label_en);
          const labelFa = normalizeString(f.labelFa ?? f.label_fa);
          const canonicalLabel = normalizeString(f.label) || labelFa || labelEn || 'Link';
          const groupEn = normalizeString(f.groupEn ?? f.group_en);
          const groupFa = normalizeString(f.groupFa ?? f.group_fa);
          const canonicalGroup = normalizeString(f.group) || groupFa || groupEn;
          return {
            label: canonicalLabel,
            labelEn,
            labelFa,
            url: normalizeString(f.url) || '/',
            group: canonicalGroup,
            groupEn,
            groupFa,
          };
        });
        await tx.footerLink.createMany({ data: footerPayload });
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
