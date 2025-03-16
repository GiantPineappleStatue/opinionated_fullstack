import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;
  private readonly logger = new Logger(RedisService.name);
  private readonly isProduction: boolean;
  private readonly maxRetries = 5;
  private retryCount = 0;
  private isConnecting = false;

  constructor(private configService: ConfigService) {
    this.isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    this.logger.log(`Redis service initialized with production mode: ${this.isProduction}`);
  }

  async onModuleInit() {
    try {
      this.logger.log('Initializing Redis connection...');
      await this.connectToRedis();
    } catch (error) {
      this.logger.error('Failed to initialize Redis module:', error);
      if (this.isProduction) {
        throw error;
      }
    }
  }

  private async connectToRedis() {
    if (this.isConnecting) {
      this.logger.warn('Redis connection already in progress');
      return;
    }

    this.isConnecting = true;
    try {
      const host = this.configService.get<string>('REDIS_HOST');
      const port = this.configService.get<number>('REDIS_PORT');
      const password = this.configService.get<string>('REDIS_PASSWORD');

      this.logger.log(`Redis configuration - Host: ${host}, Port: ${port}, Password: ${password ? 'set' : 'not set'}`);
      
      if (!host || !port) {
        throw new Error(`Invalid Redis configuration - Host: ${host}, Port: ${port}`);
      }

      this.redisClient = new Redis({
        host,
        port,
        password,
        retryStrategy: (times) => {
          const delay = Math.min(times * 1000, 5000);
          this.logger.debug(`Retrying Redis connection in ${delay}ms (attempt ${times})`);
          return delay;
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: true,
        reconnectOnError: (err) => {
          const targetError = 'READONLY';
          if (err.message.includes(targetError)) {
            return true;
          }
          return false;
        },
      });

      this.redisClient.on('error', (error) => {
        this.logger.error('Redis connection error:', error);
        if (this.isProduction) {
          this.handleConnectionError(error);
        }
      });

      this.redisClient.on('ready', () => {
        this.logger.log('Redis connection established');
        this.retryCount = 0;
        this.isConnecting = false;
      });

      this.redisClient.on('connect', () => {
        this.logger.log('Redis client connected');
      });

      this.redisClient.on('reconnecting', () => {
        this.logger.warn('Redis client reconnecting...');
      });

      this.logger.log('Attempting to connect to Redis...');
      await this.redisClient.connect();
      const pingResult = await this.redisClient.ping();
      this.logger.log(`Redis connection test successful: ${pingResult}`);
    } catch (error) {
      this.logger.error('Failed to connect to Redis:', error);
      this.isConnecting = false;
      if (this.isProduction) {
        await this.handleConnectionError(error);
      } else {
        this.logger.warn('Running in development mode - continuing without Redis');
      }
    }
  }

  private async handleConnectionError(error: Error) {
    if (this.isProduction) {
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        this.logger.warn(`Retrying Redis connection (attempt ${this.retryCount}/${this.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        await this.connectToRedis();
      } else {
        this.logger.error('Max Redis connection retries reached. Exiting application.');
        process.exit(1);
      }
    }
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      try {
        await this.redisClient.quit();
        this.logger.log('Redis connection closed');
      } catch (error) {
        this.logger.error('Error closing Redis connection:', error);
      }
    }
  }

  getClient(): Redis {
    if (!this.redisClient) {
      this.logger.error('Redis client not initialized');
      if (this.isProduction) {
        throw new Error('Redis client not initialized');
      } else {
        this.logger.warn('Redis client not initialized - attempting to reconnect');
        this.connectToRedis();
        throw new Error('Redis client not initialized - please retry');
      }
    }
    return this.redisClient;
  }

  async ping(): Promise<string> {
    if (!this.redisClient) {
      this.logger.error('Redis client not initialized');
      throw new Error('Redis client not initialized');
    }
    return this.redisClient.ping();
  }
} 