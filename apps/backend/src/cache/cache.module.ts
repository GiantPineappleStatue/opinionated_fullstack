import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { RedisModule } from '../redis/redis.module';
import { RedisService } from '../redis/redis.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { CacheController } from './cache.controller';
import { AuthModule } from '../auth/auth.module';

@Global()
@Module({
  imports: [
    ConfigModule,
    RedisModule,
    AuthModule,
    NestCacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const isProduction = configService.get<string>('NODE_ENV') === 'production';
        const config = configService.get('cache');
        const host = configService.get<string>('REDIS_HOST') || 'keydb';
        const port = configService.get<number>('REDIS_PORT') || 6379;
        
        console.log('[CacheModule] Initializing cache store with config:', {
          host,
          port,
          isProduction,
          ttl: config.ttl,
          max: config.max
        });
        
        return {
          store: 'redis',
          host,
          port,
          ttl: config.ttl,
          max: config.max,
          retryStrategy: (times: number) => {
            if (times > 10) {
              console.error('[CacheModule] Max retry attempts reached');
              return false;
            }
            const delay = Math.min(times * 1000, 3000);
            console.log(`[CacheModule] Retrying connection in ${delay}ms (attempt ${times})`);
            return delay;
          }
        };
      },
    }),
  ],
  controllers: [CacheController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
  exports: [NestCacheModule],
})
export class CacheModule {} 