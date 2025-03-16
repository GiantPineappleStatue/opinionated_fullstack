import { z } from 'zod';

const DEFAULT_API_URL = 'http://localhost:3001';
const DEFAULT_INTERNAL_API_URL = 'http://backend:3002';
const DEFAULT_API_TIMEOUT = 30000;
const DEFAULT_API_RETRY_ATTEMPTS = 3;

const envSchema = z.object({
  VITE_API_URL: z.string().url().default(DEFAULT_API_URL),
  VITE_INTERNAL_API_URL: z.string().url().default(DEFAULT_INTERNAL_API_URL),
  VITE_APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  VITE_MOCK_API: z.enum(['true', 'false']).default('false'),
  VITE_API_TIMEOUT: z.string().transform(Number).default(String(DEFAULT_API_TIMEOUT)),
  VITE_API_RETRY_ATTEMPTS: z.string().transform(Number).default(String(DEFAULT_API_RETRY_ATTEMPTS)),
});

const processEnv = {
  VITE_API_URL: import.meta.env.VITE_API_URL || DEFAULT_API_URL,
  VITE_INTERNAL_API_URL: import.meta.env.VITE_INTERNAL_API_URL || DEFAULT_INTERNAL_API_URL,
  VITE_APP_ENV: import.meta.env.VITE_APP_ENV,
  VITE_MOCK_API: import.meta.env.VITE_MOCK_API,
  VITE_API_TIMEOUT: import.meta.env.VITE_API_TIMEOUT || String(DEFAULT_API_TIMEOUT),
  VITE_API_RETRY_ATTEMPTS: import.meta.env.VITE_API_RETRY_ATTEMPTS || String(DEFAULT_API_RETRY_ATTEMPTS),
} as const;

const parsed = envSchema.safeParse(processEnv);

if (!parsed.success) {
  console.error(
    '❌ Invalid environment variables:',
    JSON.stringify(parsed.error.format(), null, 2),
  );
  throw new Error('Invalid environment variables');
}

export const env = parsed.data; 