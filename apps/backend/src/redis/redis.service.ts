import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

// Create a mock Redis client that logs operations instead of executing them
class MockRedisClient {
  private logger = new Logger('MockRedisClient');

  constructor() {
    this.logger.log('Using mock Redis client');
  }

  // Add basic Redis methods that return mock values
  async get(key: string): Promise<string | null> {
    this.logger.debug(`[MOCK] GET ${key}`);
    return null;
  }

  async set(key: string, value: string): Promise<string> {
    this.logger.debug(`[MOCK] SET ${key} ${value}`);
    return 'OK';
  }

  async del(key: string): Promise<number> {
    this.logger.debug(`[MOCK] DEL ${key}`);
    return 1;
  }

  // Add any other methods needed by your application
  async quit(): Promise<string> {
    this.logger.debug('[MOCK] QUIT');
    return 'OK';
  }

  on(event: string, callback: any): void {
    // No-op for mock client
  }

  // Add scanIterator method required by connect-redis
  scanIterator() {
    return {
      async *[Symbol.asyncIterator]() {
        // Empty iterator
      }
    };
  }
}

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis | MockRedisClient;
  private readonly logger = new Logger(RedisService.name);
  private enabled = false;

  constructor(private configService: ConfigService) {
    // Check if Redis is enabled
    this.enabled = this.configService.get<string>('redis.enabled') !== 'false';
  }

  async onModuleInit() {
    if (!this.enabled) {
      this.logger.log('Redis is disabled. Using mock implementation.');
      this.redisClient = new MockRedisClient();
      return;
    }

    try {
      this.redisClient = new Redis({
        host: this.configService.get<string>('redis.host') || 'localhost',
        port: this.configService.get<number>('redis.port') || 6379,
      });

      this.redisClient.on('error', (error) => {
        this.logger.error('Redis connection error:', error);
      });

      this.logger.log('Redis connection established');
    } catch (error) {
      this.logger.error('Failed to connect to Redis. Using mock implementation.', error.stack);
      this.redisClient = new MockRedisClient();
    }
  }

  async onModuleDestroy() {
    if (this.redisClient instanceof Redis) {
      await this.redisClient.quit();
      this.logger.log('Redis connection closed');
    }
  }

  getClient(): Redis | MockRedisClient {
    return this.redisClient;
  }
} 