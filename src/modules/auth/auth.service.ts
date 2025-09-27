import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../db/prisma';
import { env } from '../../config/env';

export async function register(email: string, password: string, name?: string) {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new Error('Email already used');
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.create({ data: { email, passwordHash, name } });
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) throw new Error('Invalid credentials');
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error('Invalid credentials');
  const access = jwt.sign({ email: user.email }, env.JWT_ACCESS_SECRET, { subject: user.id, expiresIn: env.JWT_ACCESS_EXPIRES });
  const refresh = jwt.sign({ email: user.email }, env.JWT_REFRESH_SECRET, { subject: user.id, expiresIn: env.JWT_REFRESH_EXPIRES });
  return { access, refresh, user: { id: user.id, email: user.email, name: user.name, locale: user.locale } };
}

export async function refreshToken(token: string) {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as any;
  const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
  if (!user) throw new Error('User not found');
  const access = jwt.sign({ email: user.email }, env.JWT_ACCESS_SECRET, { subject: user.id, expiresIn: env.JWT_ACCESS_EXPIRES });
  return { access };
}
