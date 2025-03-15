import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import * as session from 'express-session';
import { RedisStore } from 'connect-redis';
import { Request, Response } from 'express';
import { Redis } from 'ioredis';

// Extend the express-session types
declare module 'express-session' {
  interface SessionData {
    userId: string;
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: string;
    };
  }
}

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);
  
  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  getSessionMiddleware() {
    let store;
    
    // Check if Redis is enabled
    const redisEnabled = this.configService.get<string>('redis.enabled') !== 'false';
    
    if (redisEnabled) {
      try {
        const redisClient = this.redisService.getClient();
        
        // Only create RedisStore if we have a real Redis client
        if (redisClient instanceof Redis) {
          // Create Redis store using ioredis client
          store = new RedisStore({ 
            client: redisClient,
            prefix: 'sess:',
          });
          this.logger.log('Using Redis store for sessions');
        } else {
          // Fall back to memory store
          store = new session.MemoryStore();
          this.logger.warn('Redis client is not available. Using memory store for sessions (not suitable for production)');
        }
      } catch (error) {
        this.logger.error('Failed to create Redis store:', error);
        // Fall back to memory store
        store = new session.MemoryStore();
        this.logger.warn('Falling back to memory store for sessions (not suitable for production)');
      }
    } else {
      // Use memory store if Redis is disabled
      store = new session.MemoryStore();
      this.logger.warn('Redis is disabled. Using memory store for sessions (not suitable for production)');
    }
    
    return session({
      store,
      secret: this.configService.get<string>('jwt.secret') || 'super-secret-key-change-in-production',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: this.configService.get<string>('NODE_ENV') === 'production',
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        sameSite: 'lax',
      },
    });
  }

  // Helper method to set user session
  setSession(req: Request, userId: string, userData: any) {
    req.session.userId = userId;
    req.session.user = userData;
  }

  // Helper method to clear user session
  clearSession(req: Request, res: Response) {
    return new Promise<void>((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          reject(err);
          return;
        }
        res.clearCookie('connect.sid');
        resolve();
      });
    });
  }
} 