import OpenAI from 'openai';
import { env } from '../../config/env';
const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

export async function translate(text: string, target: string) {
  if (!env.OPENAI_API_KEY) return text; // fallback: no-op
  const { choices } = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: `Translate into ${target}. Preserve names and tone. Output ${target}.` },
      { role: 'user', content: text }
    ],
    temperature: 0.2
  });
  return choices[0]?.message?.content ?? text;
}
