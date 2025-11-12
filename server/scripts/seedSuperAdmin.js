#!/usr/bin/env node
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import prisma from '../prismaClient.js';

async function main() {
  const email = process.env.SUPERADMIN_EMAIL;
  const username = process.env.SUPERADMIN_USERNAME;
  const password = process.env.SUPERADMIN_PASSWORD;
  if ((!email && !username) || !password) {
    console.error('Provide SUPERADMIN_USERNAME or SUPERADMIN_EMAIL plus SUPERADMIN_PASSWORD environment variables.');
    process.exit(1);
  }
  let existing = null;
  if (username) existing = await prisma.adminUser.findUnique({ where: { username } });
  if (!existing && email) existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.log('Superadmin already exists:', email);
    return;
  }
  const hash = await bcrypt.hash(password, 12);
  const user = await prisma.adminUser.create({
    data: { email: email || `${username}@local`, username: username || null, passwordHash: hash, role: 'SUPERADMIN', active: true, name: 'Super Admin' }
  });
  console.log('Created SUPERADMIN user:', user.email);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
