import express from 'express';
import prisma from '../prismaClient.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const timeline = await prisma.aboutTimeline.findMany({ orderBy: { year: 'asc' } });
    const values = await prisma.aboutValue.findMany();
    const skills = await prisma.aboutSkill.findMany();
    const mission = await prisma.aboutMission.findUnique({ where: { id: 1 } });
    const missionBullets = await prisma.aboutMissionBullet.findMany();
    res.json({ timeline, values, skills, mission, missionBullets });
  } catch (e) {
    res.status(500).json({ error: 'about_fetch_failed' });
  }
});

router.put('/', async (req, res) => {
  const { timeline, values, skills, mission, missionBullets } = req.body;
  try {
    await prisma.$transaction(async (tx) => {
      if (timeline) {
        await tx.aboutTimeline.deleteMany();
        await tx.aboutTimeline.createMany({ data: timeline.map(t => ({ year: t.year, title: t.title, description: t.description || null })) });
      }
      if (values) {
        await tx.aboutValue.deleteMany();
        for (const v of values) await tx.aboutValue.create({ data: { title: v.title, description: v.description || null, icon: v.icon || null } });
      }
      if (skills) {
        await tx.aboutSkill.deleteMany();
        await tx.aboutSkill.createMany({ data: skills.map(s => ({ name: s.name, level: s.level })) });
      }
      if (mission) {
        await tx.aboutMission.upsert({ where: { id: 1 }, update: mission, create: { id: 1, ...mission } });
      }
      if (missionBullets) {
        await tx.aboutMissionBullet.deleteMany();
        await tx.aboutMissionBullet.createMany({ data: missionBullets.map(b => ({ text: b.text })) });
      }
    });
    res.json({ updated: true });
  } catch (e) {
    res.status(500).json({ error: 'about_update_failed' });
  }
});

export default router;
