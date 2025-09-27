import { Router } from 'express';
import { prisma } from '../../db/prisma';
import { authGuard, AuthedRequest } from '../../middlewares/authGuard';
import { getOrCreateTranslation } from './translations.service';

const r = Router();

r.get('/room/:roomId', authGuard, async (req: AuthedRequest, res) => {
  const { roomId } = req.params;
  const msgs = await prisma.message.findMany({ where: { roomId }, orderBy: { createdAt: 'asc' }, take: 200 });
  res.json(msgs);
});

r.post('/room/:roomId', authGuard, async (req: AuthedRequest, res) => {
  const { roomId } = req.params; const { body } = req.body as { body: string };
  const msg = await prisma.message.create({ data: { roomId, senderId: req.user!.id, body } });
  res.json(msg);
});

r.get('/:id/translate', authGuard, async (req: AuthedRequest, res) => {
  const { id } = req.params; const { locale = 'ja' } = req.query as any;
  const tr = await getOrCreateTranslation(id, String(locale));
  res.json({ messageId: id, locale, translated: tr.translated });
});

export default r;
