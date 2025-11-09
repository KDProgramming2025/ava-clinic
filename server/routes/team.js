import express from 'express';
import prisma from '../prismaClient.js';

const router = express.Router();

// GET team members
router.get('/', async (_req, res) => {
  try {
    const members = await prisma.teamMember.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(members);
  } catch (e) {
    res.status(500).json({ error: 'list_failed' });
  }
});

// POST create team member
router.post('/', async (req, res) => {
  const { name, role, bio, image, active } = req.body;
  if (!name || !role) return res.status(400).json({ error: 'missing_fields' });
  try {
    const created = await prisma.teamMember.create({ data: { name, role, bio: bio || null, image: image || null, active: active ?? true } });
    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ error: 'create_failed' });
  }
});

// PUT update member
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, role, bio, image, active } = req.body;
  try {
    const updated = await prisma.teamMember.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(role !== undefined ? { role } : {}),
        ...(bio !== undefined ? { bio } : {}),
        ...(image !== undefined ? { image } : {}),
        ...(active !== undefined ? { active } : {}),
      },
    });
    res.json(updated);
  } catch (e) {
    res.status(404).json({ error: 'not_found' });
  }
});

// DELETE member
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.teamMember.delete({ where: { id } });
    res.json({ deleted: id });
  } catch (e) {
    res.status(404).json({ error: 'not_found' });
  }
});

export default router;
