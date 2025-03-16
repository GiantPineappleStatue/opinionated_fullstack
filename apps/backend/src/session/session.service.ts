import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as session from 'express-session';
import { Request, Response } from 'express';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { EventEmitter } from 'events';

// Extend the express-session types
declare module 'express-session' {
  interface SessionData {
    id: string;
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
  private readonly isProduction: boolean;
  private readonly eventEmitter: EventEmitter;
  
  constructor(
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    this.eventEmitter = new EventEmitter();
  }

  getSessionMiddleware() {
    const config = this.configService.get('session');
    
    this.logger.debug('[SessionService] Initializing session middleware with config:', {
      secure: this.isProduction ? true : config.cookie.secure,
      name: 'sessionId',
      resave: false,
      saveUninitialized: false,
      rolling: true,
      ttl: config.ttl,
      cookiePath: '/api'
    });
    
    const sessionConfig: session.SessionOptions = {
      secret: config.secret,
      resave: false,
      saveUninitialized: false,
      rolling: true,
      name: 'sessionId',
      cookie: {
        ...config.cookie,
        // Ensure secure cookies in production
        secure: this.isProduction ? true : config.cookie.secure,
        // Set cookie path to /api to match global prefix
        path: '/api',
      },
      store: {
        get: async (sid: string) => {
          try {
            this.logger.debug('[SessionService] Getting session from store:', { sid });
            const data = await this.cacheManager.get(`sess:${sid}`);
            this.logger.debug('[SessionService] Session data retrieved:', { 
              sid,
              hasData: !!data,
              sessionData: data ? JSON.parse(data as string) : null
            });
            return data ? JSON.parse(data as string) : null;
          } catch (error) {
            this.logger.error('[SessionService] Error getting session:', {
              sid,
              error: error.message,
              stack: error.stack
            });
            throw error;
          }
        },
        set: async (sid: string, session: any) => {
          try {
            this.logger.debug('[SessionService] Setting session in store:', { 
              sid,
              userId: session.userId,
              ttl: config.ttl,
              sessionData: session
            });
            await this.cacheManager.set(`sess:${sid}`, JSON.stringify(session), config.ttl * 1000);
            this.logger.debug('[SessionService] Session saved successfully:', { sid });
          } catch (error) {
            this.logger.error('[SessionService] Error setting session:', {
              sid,
              error: error.message,
              stack: error.stack
            });
            throw error;
          }
        },
        destroy: async (sid: string) => {
          try {
            this.logger.debug('[SessionService] Destroying session:', { sid });
            await this.cacheManager.del(`sess:${sid}`);
            this.logger.debug('[SessionService] Session destroyed successfully:', { sid });
          } catch (error) {
            this.logger.error('[SessionService] Error destroying session:', {
              sid,
              error: error.message,
              stack: error.stack
            });
            throw error;
          }
        },
        all: async () => {
          // This is a simplified implementation
          return [];
        },
        regenerate: async (req: Request, fn: (err?: any) => void) => {
          const oldSid = req.sessionID;
          req.session.regenerate((err) => {
            if (err) {
              fn(err);
              return;
            }
            this.cacheManager.del(`sess:${oldSid}`).catch(() => {});
            fn();
          });
        },
        load: async (sid: string, fn: (err: any, session?: any) => void) => {
          try {
            const data = await this.cacheManager.get(`sess:${sid}`);
            fn(null, data ? JSON.parse(data as string) : null);
          } catch (err) {
            fn(err);
          }
        },
        createSession: (req: Request, session: session.SessionData) => {
          req.sessionID = session.id;
          req.session = session as session.Session & session.SessionData;
          return req.session;
        },
        addListener: (event: string | symbol, listener: (...args: any[]) => void) => {
          this.eventEmitter.addListener(event, listener);
          return this;
        },
        removeListener: (event: string | symbol, listener: (...args: any[]) => void) => {
          this.eventEmitter.removeListener(event, listener);
          return this;
        },
        removeAllListeners: (event?: string | symbol) => {
          this.eventEmitter.removeAllListeners(event);
          return this;
        },
        on: (event: string | symbol, listener: (...args: any[]) => void) => {
          this.eventEmitter.on(event, listener);
          return this;
        },
        once: (event: string | symbol, listener: (...args: any[]) => void) => {
          this.eventEmitter.once(event, listener);
          return this;
        },
        emit: (event: string | symbol, ...args: any[]) => {
          return this.eventEmitter.emit(event, ...args);
        },
        listenerCount: (event: string | symbol) => {
          return this.eventEmitter.listenerCount(event);
        },
        listeners: (event: string | symbol) => {
          return this.eventEmitter.listeners(event);
        },
        rawListeners: (event: string | symbol) => {
          return this.eventEmitter.rawListeners(event);
        },
        eventNames: () => {
          return this.eventEmitter.eventNames();
        },
        prependListener: (event: string | symbol, listener: (...args: any[]) => void) => {
          this.eventEmitter.prependListener(event, listener);
          return this;
        },
        prependOnceListener: (event: string | symbol, listener: (...args: any[]) => void) => {
          this.eventEmitter.prependOnceListener(event, listener);
          return this;
        },
        getMaxListeners: () => {
          return this.eventEmitter.getMaxListeners();
        },
        setMaxListeners: (n: number) => {
          this.eventEmitter.setMaxListeners(n);
          return this;
        },
      } as unknown as session.Store,
    };

    return session(sessionConfig);
  }

  // Helper method to set user session
  setSession(req: Request, userId: string, userData: any) {
    this.logger.debug('[SessionService] Setting user session:', { 
      sessionID: req.sessionID,
      userId,
      userData: {
        id: userData.id,
        email: userData.email,
        role: userData.role
      }
    });
    req.session.userId = userId;
    req.session.user = userData;
  }

  // Helper method to clear user session
  clearSession(req: Request, res: Response) {
    this.logger.debug('[SessionService] Clearing user session:', { 
      sessionID: req.sessionID,
      userId: req.session?.userId
    });
    return new Promise<void>((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          this.logger.error('[SessionService] Error clearing session:', { 
            sessionID: req.sessionID,
            error: err.message
          });
          reject(err);
          return;
        }
        res.clearCookie('sessionId', { path: '/api' });
        this.logger.debug('[SessionService] Session cleared successfully');
        resolve();
      });
    });
  }
} 