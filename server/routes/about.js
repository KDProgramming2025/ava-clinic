import express from 'express';
import prisma from '../prismaClient.js';

const router = express.Router();

const stringOrNull = (value) => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return null;
};

const extractBilingual = (payload = {}, key) => {
  const en = stringOrNull(payload[`${key}En`] ?? payload[`${key}_en`]);
  const fa = stringOrNull(payload[`${key}Fa`] ?? payload[`${key}_fa`]);
  const canonical = stringOrNull(payload[key]) ?? fa ?? en ?? null;
  return { canonical, en, fa };
};

const numericOrDefault = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

router.get('/', async (_req, res) => {
  try {
    const timeline = await prisma.aboutTimeline.findMany({ orderBy: { year: 'asc' } });
    const values = await prisma.aboutValue.findMany();
    const skills = await prisma.aboutSkill.findMany();
    const mission = await prisma.aboutMission.findUnique({ where: { id: 1 } });
    const missionBullets = await prisma.aboutMissionBullet.findMany();
    const stats = await prisma.aboutStat.findMany();
    res.json({ timeline, values, skills, mission, missionBullets, stats });
  } catch (e) {
    console.error('[about GET] Error:', e.message, e.stack);
    res.status(500).json({ error: 'about_fetch_failed', details: e.message });
  }
});

router.put('/', async (req, res) => {
  const { timeline, values, skills, mission, missionBullets, stats } = req.body;
  try {
    await prisma.$transaction(async (tx) => {
      if (timeline) {
        await tx.aboutTimeline.deleteMany();
        const data = timeline.map((t, index) => {
          const title = extractBilingual(t, 'title');
          const description = extractBilingual(t, 'description');
          const entry = {
            year: numericOrDefault(t.year, 2000 + index),
            title: title.canonical || `Timeline ${index + 1}`,
            titleEn: title.en,
            titleFa: title.fa,
            description: description.canonical,
            descriptionEn: description.en,
            descriptionFa: description.fa,
          };
          const id = stringOrNull(t.id);
          if (id) entry.id = id;
          return entry;
        });
        await tx.aboutTimeline.createMany({ data });
      }
      if (values) {
        await tx.aboutValue.deleteMany();
        for (const v of values) {
          const title = extractBilingual(v, 'title');
          const description = extractBilingual(v, 'description');
          const entry = {
            title: title.canonical || 'Value',
            titleEn: title.en,
            titleFa: title.fa,
            description: description.canonical,
            descriptionEn: description.en,
            descriptionFa: description.fa,
            icon: stringOrNull(v.icon),
          };
          const id = stringOrNull(v.id);
          if (id) entry.id = id;
          await tx.aboutValue.create({ data: entry });
        }
      }
      if (skills) {
        await tx.aboutSkill.deleteMany();
        const skillData = skills.map((s, index) => {
          const name = extractBilingual(s, 'name');
          const entry = {
            name: name.canonical || `Skill ${index + 1}`,
            nameEn: name.en,
            nameFa: name.fa,
            level: Math.max(0, Math.min(100, numericOrDefault(s.level, 0))),
          };
          const id = stringOrNull(s.id);
          if (id) entry.id = id;
          return entry;
        });
        await tx.aboutSkill.createMany({ data: skillData });
      }
      if (mission) {
        const heading = extractBilingual(mission, 'heading');
        const paragraph = extractBilingual(mission, 'paragraph');
        const missionPayload = {
          heading: heading.canonical,
          headingEn: heading.en,
          headingFa: heading.fa,
          paragraph: paragraph.canonical,
          paragraphEn: paragraph.en,
          paragraphFa: paragraph.fa,
          imageHeroUrl: stringOrNull(mission.imageHeroUrl),
          imageSecondaryUrl: stringOrNull(mission.imageSecondaryUrl),
        };
        await tx.aboutMission.upsert({ where: { id: 1 }, update: missionPayload, create: { id: 1, ...missionPayload } });
      }
      if (missionBullets) {
        await tx.aboutMissionBullet.deleteMany();
        const bulletData = missionBullets.map((b, index) => {
          const text = extractBilingual(b, 'text');
          const entry = {
            text: text.canonical || `Bullet ${index + 1}`,
            textEn: text.en,
            textFa: text.fa,
          };
          const id = stringOrNull(b.id);
          if (id) entry.id = id;
          return entry;
        });
        await tx.aboutMissionBullet.createMany({ data: bulletData });
      }
      if (stats) {
        await tx.aboutStat.deleteMany();
        const statsData = stats.map((s, index) => {
          const label = extractBilingual(s, 'label');
          const entry = {
            label: label.canonical || `Stat ${index + 1}`,
            labelEn: label.en,
            labelFa: label.fa,
            value: stringOrNull(s.value) || '0',
            icon: stringOrNull(s.icon),
          };
          const id = stringOrNull(s.id);
          if (id) entry.id = id;
          return entry;
        });
        await tx.aboutStat.createMany({ data: statsData });
      }
    });
    res.json({ updated: true });
  } catch (e) {
    res.status(500).json({ error: 'about_update_failed' });
  }
});

router.put('/mission/image', async (req, res) => {
  const { field, imageUrl } = req.body;
  try {
    if (!field || !['imageHeroUrl', 'imageSecondaryUrl'].includes(field)) {
      return res.status(400).json({ error: 'invalid_field', details: 'field must be imageHeroUrl or imageSecondaryUrl' });
    }
    
    const updateData = { [field]: stringOrNull(imageUrl) };
    const mission = await prisma.aboutMission.upsert({
      where: { id: 1 },
      update: updateData,
      create: { id: 1, ...updateData }
    });
    
    res.json(mission);
  } catch (e) {
    console.error('[about mission/image PUT] Error:', e.message, e.stack);
    res.status(500).json({ error: 'mission_image_update_failed', details: e.message });
  }
});

export default router;
