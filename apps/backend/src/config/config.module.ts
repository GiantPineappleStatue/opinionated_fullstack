import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';
import { backendEnvSchema } from '@repo/shared-types';

// Custom validate function for ConfigModule
const validate = (config: Record<string, unknown>) => {
  const result = backendEnvSchema.safeParse(config);
  if (!result.success) {
    throw new Error(`Environment validation error: ${result.error.message}`);
  }
  return result.data;
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
    }),
  ],
})
export class AppConfigModule {} 