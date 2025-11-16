import express from 'express';
import prisma from '../prismaClient.js';

const router = express.Router();

// GET all testimonials
router.get('/', async (_req, res) => {
  try {
    const items = await prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: 'list_failed' });
  }
});

// POST create testimonial
router.post('/', async (req, res) => {
  const { name, text, rating, image, nameEn, nameFa, textEn, textFa } = req.body;
  const baseName = name ?? nameFa ?? nameEn;
  const baseText = text ?? textFa ?? textEn;
  if (!baseName || !baseText) return res.status(400).json({ error: 'missing_fields' });
  const r = Number(rating);
  if (!Number.isInteger(r) || r < 1 || r > 5) return res.status(400).json({ error: 'invalid_rating' });
  try {
    const created = await prisma.testimonial.create({
      data: {
        name: baseName,
        text: baseText,
        nameEn,
        nameFa,
        textEn,
        textFa,
        rating: r,
        image: image || null,
      },
    });
    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ error: 'create_failed' });
  }
});

// PUT update testimonial
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, text, rating, image, nameEn, nameFa, textEn, textFa } = req.body;
  const data = {};
  if (name !== undefined || nameFa !== undefined || nameEn !== undefined) {
    const value = name ?? nameFa ?? nameEn;
    if (value) data.name = value;
    if (nameEn !== undefined) data.nameEn = nameEn;
    if (nameFa !== undefined) data.nameFa = nameFa;
  }
  if (text !== undefined || textFa !== undefined || textEn !== undefined) {
    const value = text ?? textFa ?? textEn;
    if (value) data.text = value;
    if (textEn !== undefined) data.textEn = textEn;
    if (textFa !== undefined) data.textFa = textFa;
  }
  if (rating !== undefined) {
    const r = Number(rating);
    if (!Number.isInteger(r) || r < 1 || r > 5) return res.status(400).json({ error: 'invalid_rating' });
    data.rating = r;
  }
  if (image !== undefined) data.image = image;
  try {
    const updated = await prisma.testimonial.update({ where: { id }, data });
    res.json(updated);
  } catch (e) {
    res.status(404).json({ error: 'not_found' });
  }
});

// DELETE testimonial
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.testimonial.delete({ where: { id } });
    res.json({ deleted: id });
  } catch (e) {
    res.status(404).json({ error: 'not_found' });
  }
});

export default router;
