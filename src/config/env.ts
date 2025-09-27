import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES: z.string().default('7d'),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  OPENAI_API_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);
