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
      imports: [ConfigModule, RedisModule],
      inject: [ConfigService, RedisService],
      useFactory: async (configService: ConfigService, redisService: RedisService) => {
        const isRedisEnabled = configService.get<string>('redis.enabled') !== 'false';
        
        // If Redis is disabled, use memory store (default)
        if (!isRedisEnabled) {
          return {
            ttl: 300, // 5 minutes default TTL
            max: 1000, // Maximum number of items in cache
          };
        }
        
        // Use Redis store if Redis is enabled
        try {
          const redisClient = redisService.getClient();
          
          return {
            store: {
              create: () => redisClient,
            },
            ttl: 300, // 5 minutes default TTL
          };
        } catch (error) {
          console.error('Failed to create Redis store for cache:', error);
          // Fallback to memory store
          return {
            ttl: 300, // 5 minutes default TTL
            max: 1000, // Maximum number of items in cache
          };
        }
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