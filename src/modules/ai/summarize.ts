import OpenAI from 'openai';
import { env } from '../../config/env';
const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

export async function summarize(messages: Array<{sender: string; text: string}>, locale: string) {
  const joined = messages.map(m => `${m.sender}: ${m.text}`).join('\n');
  if (!env.OPENAI_API_KEY) return 'OPENAI_API_KEY not set (summary disabled)';
  const { choices } = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: `Summarize in ${locale}. Include participants, topics, decisions, and action items.` },
      { role: 'user', content: joined }
    ],
    temperature: 0.2
  });
  return choices[0]?.message?.content ?? '';
}
