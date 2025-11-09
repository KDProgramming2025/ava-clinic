import express from 'express';
import prisma from '../prismaClient.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const hero = await prisma.homeHero.findUnique({ where: { id: 1 } });
    const stats = await prisma.homeStat.findMany();
    const features = await prisma.homeFeature.findMany();
    const cta = await prisma.homeCTA.findUnique({ where: { id: 1 } });
    const testimonials = await prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' }, take: 20 });
    res.json({ hero, stats, features, cta, testimonials });
  } catch (e) {
    res.status(500).json({ error: 'home_fetch_failed' });
  }
});

router.put('/', async (req, res) => {
  const { hero, stats, features, cta } = req.body;
  try {
    const result = await prisma.$transaction(async (tx) => {
      let heroRecord;
      if (hero) {
        heroRecord = await tx.homeHero.upsert({
          where: { id: 1 },
            update: hero,
            create: { id: 1, ...hero },
        });
      }
      if (stats) {
        await tx.homeStat.deleteMany();
        await tx.homeStat.createMany({ data: stats.map(s => ({ label: s.label, value: s.value, icon: s.icon || null })) });
      }
      if (features) {
        await tx.homeFeature.deleteMany();
        for (const f of features) {
          await tx.homeFeature.create({ data: { title: f.title, description: f.description || null, icon: f.icon || null } });
        }
      }
      let ctaRecord;
      if (cta) {
        ctaRecord = await tx.homeCTA.upsert({
          where: { id: 1 },
          update: cta,
          create: { id: 1, ...cta },
        });
      }
      return { hero: heroRecord, cta: ctaRecord };
    });
    res.json({ updated: true, ...result });
  } catch (e) {
    res.status(500).json({ error: 'home_update_failed' });
  }
});

export default router;
