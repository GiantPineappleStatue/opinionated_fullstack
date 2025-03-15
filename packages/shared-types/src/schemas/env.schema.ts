import { z } from 'zod';

// Environment schema for backend
export const backendEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().default(3306),
  DB_USERNAME: z.string().default('root'),
  DB_PASSWORD: z.string().default('password'),
  DB_DATABASE: z.string().default('fullstack_db'),
  JWT_SECRET: z.string().default('super-secret-key-change-in-production'),
  JWT_EXPIRES_IN: z.string().default('1d'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  RABBITMQ_URL: z.string().default('amqp://localhost:5672'),
  RABBITMQ_QUEUE: z.string().default('tasks'),
  NATS_URL: z.string().default('nats://localhost:4222'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  THROTTLE_TTL: z.coerce.number().default(60),
  THROTTLE_LIMIT: z.coerce.number().default(10),
});

// Environment schema for frontend
export const frontendEnvSchema = z.object({
  VITE_API_URL: z.string().url().default('http://localhost:3000/api'),
  VITE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  VITE_ENABLE_MOCKS: z.coerce.boolean().default(true),
});

// Types derived from schemas
export type BackendEnv = z.infer<typeof backendEnvSchema>;
export type FrontendEnv = z.infer<typeof frontendEnvSchema>; 