import express from 'express';
import prisma from '../prismaClient.js';
import bcrypt from 'bcryptjs';
import { authMiddleware } from './auth.js';

const router = express.Router();

// GET /api/admin-users
router.get('/', async (_req, res) => {
  try {
    const users = await prisma.adminUser.findMany({ orderBy: { createdAt: 'desc' }, select: { id: true, email: true, name: true, role: true, active: true, createdAt: true, updatedAt: true } });
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: 'admin_users_list_failed' });
  }
});

// POST /api/admin-users
// Body: { email, password, name?, role? }
router.post('/', authMiddleware(['SUPERADMIN','ADMIN']), async (req, res) => {
  const { email, password, name, role } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'missing_fields' });
  try {
    const hash = await bcrypt.hash(password, 12);
    const created = await prisma.adminUser.create({ data: { email, passwordHash: hash, name: name || null, role: role || undefined } });
    res.status(201).json({ id: created.id, email: created.email, name: created.name, role: created.role, active: created.active });
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'email_exists' });
    res.status(500).json({ error: 'admin_user_create_failed' });
  }
});

// PUT /api/admin-users/:id (update name, role, active, reset password)
router.put('/:id', authMiddleware(['SUPERADMIN','ADMIN']), async (req, res) => {
  const { id } = req.params;
  const { name, role, active, password } = req.body || {};
  try {
    const data = { };
    if (name !== undefined) data.name = name || null;
    if (role !== undefined) data.role = role;
    if (active !== undefined) data.active = !!active;
    if (password) data.passwordHash = await bcrypt.hash(password, 12);
    const updated = await prisma.adminUser.update({ where: { id }, data });
    res.json({ id: updated.id, email: updated.email, name: updated.name, role: updated.role, active: updated.active });
  } catch (e) {
    res.status(404).json({ error: 'not_found' });
  }
});

// DELETE /api/admin-users/:id
router.delete('/:id', authMiddleware(['SUPERADMIN','ADMIN']), async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.adminUser.delete({ where: { id } });
    res.json({ deleted: id });
  } catch (e) {
    res.status(404).json({ error: 'not_found' });
  }
});

export default router;
