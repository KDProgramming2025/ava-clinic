import express from 'express';
import prisma from '../prismaClient.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const blocks = await prisma.contactInfoBlock.findMany({ include: { values: true } });
    const faq = await prisma.contactFaq.findMany();
    const social = await prisma.socialLink.findMany();
    const quickActions = await prisma.quickAction.findMany();
    res.json({ blocks, faq, social, quickActions });
  } catch (e) {
    res.status(500).json({ error: 'contact_fetch_failed' });
  }
});

router.put('/', async (req, res) => {
  const { blocks, faq, social, quickActions } = req.body;
  try {
    await prisma.$transaction(async (tx) => {
      if (blocks) {
        await tx.contactInfoValue.deleteMany();
        await tx.contactInfoBlock.deleteMany();
        for (const b of blocks) {
          const createdBlock = await tx.contactInfoBlock.create({ data: { type: b.type, title: b.title } });
            if (b.values) {
              for (const v of b.values) {
                await tx.contactInfoValue.create({ data: { value: v, blockId: createdBlock.id } });
              }
            }
        }
      }
      if (faq) {
        await tx.contactFaq.deleteMany();
        await tx.contactFaq.createMany({ data: faq.map(f => ({ question: f.question, answer: f.answer })) });
      }
      if (social) {
        await tx.socialLink.deleteMany();
        await tx.socialLink.createMany({ data: social.map(s => ({ platform: s.platform, url: s.url, icon: s.icon || null })) });
      }
      if (quickActions) {
        await tx.quickAction.deleteMany();
        await tx.quickAction.createMany({ data: quickActions.map(q => ({ label: q.label, type: q.type, target: q.target })) });
      }
    });
    res.json({ updated: true });
  } catch (e) {
    res.status(500).json({ error: 'contact_update_failed' });
  }
});

export default router;
