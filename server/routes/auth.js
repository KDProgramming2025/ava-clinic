import express from 'express';
import prisma from '../prismaClient.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-insecure-secret';
const JWT_EXPIRES = '2h';

// Basic rate limiting for login to reduce brute force attempts
const loginLimiter = rateLimit({
  windowMs: parseInt(process.env.RL_WINDOW_MS || '900000', 10), // 15 minutes
  limit: parseInt(process.env.RL_MAX || '20', 10), // 20 attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'too_many_requests' },
});

// POST /api/auth/login { email, password }
router.post('/login', loginLimiter, async (req, res) => {
  const { email, identifier, password } = req.body || {};
  const id = (identifier || email || '').trim();
  if (!id || !password) return res.status(400).json({ error: 'missing_credentials' });
  try {
    let user = null;
    if (id.includes('@')) {
      user = await prisma.adminUser.findUnique({ where: { email: id } });
    } else {
      // Try username first, then fallback to email
      user = await prisma.adminUser.findUnique({ where: { username: id } });
      if (!user) user = await prisma.adminUser.findUnique({ where: { email: id } });
    }
    if (!user || !user.active) return res.status(401).json({ error: 'invalid_login' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'invalid_login' });
    const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.json({ token, user: { id: user.id, email: user.email, username: user.username, name: user.name, role: user.role } });
  } catch (e) {
    res.status(500).json({ error: 'login_failed' });
  }
});

// GET /api/auth/me - return current admin user info based on token
router.get('/me', async (req, res) => {
  const header = req.headers.authorization || '';
  const [, token] = header.split(' ');
  if (!token) return res.status(401).json({ error: 'missing_token' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await prisma.adminUser.findUnique({ where: { id: payload.sub }, select: { id: true, email: true, username: true, name: true, role: true, active: true } });
    if (!user) return res.status(404).json({ error: 'not_found' });
    res.json({ user });
  } catch (e) {
    return res.status(401).json({ error: 'invalid_token' });
  }
});

export function authMiddleware(requiredRoles = []) {
  return (req, res, next) => {
    const header = req.headers.authorization || '';
    const [, token] = header.split(' ');
    if (!token) return res.status(401).json({ error: 'missing_token' });
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      req.auth = payload; // { sub, role, iat, exp }
      if (requiredRoles.length && !requiredRoles.includes(payload.role)) {
        return res.status(403).json({ error: 'forbidden' });
      }
      next();
    } catch (e) {
      return res.status(401).json({ error: 'invalid_token' });
    }
  };
}

export default router;
