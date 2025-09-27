import { Queue, Worker, QueueEvents, JobsOptions } from 'bullmq';
import { redis } from '../db/redis';
import { summarize } from '../modules/ai/summarize';
import { prisma } from '../db/prisma';

export const SUMMARY_QUEUE = new Queue('summary', { connection: redis });
export const SUMMARY_EVENTS = new QueueEvents('summary', { connection: redis });

export const summaryWorker = new Worker('summary', async job => {
  const { messages, locale, roomId, requestedBy } = job.data as { messages: any[]; locale: string; roomId: string; requestedBy: string };
  const text = await summarize(messages, locale);
  await prisma.summary.create({ data: { roomId, requestedBy, range: { limit: messages.length }, locale, text, model: 'gpt-4o' } });
  return { text, roomId };
}, { connection: redis });

export function enqueueSummary(data: any, opts?: JobsOptions) {
  return SUMMARY_QUEUE.add('generate', data, { attempts: 2, removeOnComplete: true, ...opts });
}
