import { z } from 'zod';

const commaList = z.string().transform((value) =>
  value
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry !== '')
);

const EnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  HOST: z.string().default('0.0.0.0'),
  WIKIPEDIA_API_URL: z.url().default('https://en.wikipedia.org/w/api.php'),
  CORS_ORIGINS: commaList.default([
    'http://localhost:4173',
    'http://localhost:5173',
  ]),
});

// fails on startup if not valid
export const config = EnvSchema.parse(process.env);
