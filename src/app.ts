import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import authRouter from './modules/auth/auth.router';
import roomsRouter from './modules/rooms/rooms.router';
import messagesRouter from './modules/messages/messages.router';

export const app = express();
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(helmet());
app.use(express.json({ limit: '2mb' }));
app.use(rateLimit({ windowMs: 60_000, max: 120 }));

app.get('/health', (_, res) => res.json({ ok: true }));
app.use('/api/auth', authRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/messages', messagesRouter);
