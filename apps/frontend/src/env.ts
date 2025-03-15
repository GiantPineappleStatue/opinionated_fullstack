import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.string().url(),
  VITE_APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  VITE_MOCK_API: z.enum(['true', 'false']).default('false'),
});

const processEnv = {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_APP_ENV: import.meta.env.VITE_APP_ENV,
  VITE_MOCK_API: import.meta.env.VITE_MOCK_API,
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