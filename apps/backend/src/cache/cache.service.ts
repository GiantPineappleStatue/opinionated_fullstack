import { Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

/**
 * Cache key prefixes for different entity types
 */
export enum CachePrefix {
  USER = 'user',
  PROFILE = 'profile',
  TASK = 'task',
  SETTINGS = 'settings',
  METRICS = 'metrics',
  OPENAI = 'openai',
}

/**
 * Cache TTL values in seconds
 */
export enum CacheTTL {
  SHORT = 60, // 1 minute
  MEDIUM = 300, // 5 minutes
  LONG = 1800, // 30 minutes
  VERY_LONG = 86400, // 24 hours
}

/**
 * Enhanced cache service with additional features
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly cacheHitMetrics: Map<string, number> = new Map();
  private readonly cacheMissMetrics: Map<string, number> = new Map();

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Generate a cache key with prefix and identifier
   */
  generateKey(prefix: CachePrefix, identifier: string, subIdentifier?: string): string {
    return subIdentifier 
      ? `${prefix}:${identifier}:${subIdentifier}`
      : `${prefix}:${identifier}`;
  }

  /**
   * Get a value from cache with metrics tracking
   */
  async get<T>(key: string): Promise<T | undefined> {
    try {
      const value = await this.cacheManager.get<T>(key);
      
      // Track metrics
      if (value !== undefined && value !== null) {
        this.trackCacheHit(key);
        return value;
      } else {
        this.trackCacheMiss(key);
        return undefined;
      }
    } catch (error) {
      this.logger.error(`Error getting cache key ${key}: ${error.message}`, error.stack);
      return undefined;
    }
  }

  /**
   * Set a value in cache with TTL
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
      this.logger.debug(`Cache set: ${key} (TTL: ${ttl || 'default'}s)`);
    } catch (error) {
      this.logger.error(`Error setting cache key ${key}: ${error.message}`, error.stack);
    }
  }

  /**
   * Delete a value from cache
   */
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.debug(`Cache deleted: ${key}`);
    } catch (error) {
      this.logger.error(`Error deleting cache key ${key}: ${error.message}`, error.stack);
    }
  }

  /**
   * Get or set cache value with factory function
   */
  async getOrSet<T>(key: string, factory: () => Promise<T>, ttl?: number): Promise<T> {
    const cachedValue = await this.get<T>(key);
    
    if (cachedValue !== undefined) {
      return cachedValue;
    }
    
    const value = await factory();
    await this.set(key, value, ttl);
    return value;
  }

  /**
   * Invalidate all cache entries for a specific entity
   */
  async invalidateByPrefix(prefix: string): Promise<void> {
    try {
      // This is a basic implementation that works with the default memory store
      // For Redis, you would need to use the SCAN command
      const store = this.cacheManager as any;
      
      // If we have access to the store's keys method, use it
      if (store.store && typeof store.store.keys === 'function') {
        const keys = await store.store.keys(`${prefix}*`);
        if (keys && keys.length > 0) {
          await Promise.all(keys.map(key => this.cacheManager.del(key)));
          this.logger.debug(`Deleted ${keys.length} keys with prefix: ${prefix}`);
        }
      } else {
        this.logger.warn(`Cache store doesn't support pattern deletion for prefix: ${prefix}`);
      }
    } catch (error) {
      this.logger.error(`Error invalidating cache by prefix ${prefix}: ${error.message}`, error.stack);
    }
  }

  /**
   * Track cache hit for metrics
   */
  private trackCacheHit(key: string): void {
    const prefix = key.split(':')[0];
    const current = this.cacheHitMetrics.get(prefix) || 0;
    this.cacheHitMetrics.set(prefix, current + 1);
  }

  /**
   * Track cache miss for metrics
   */
  private trackCacheMiss(key: string): void {
    const prefix = key.split(':')[0];
    const current = this.cacheMissMetrics.get(prefix) || 0;
    this.cacheMissMetrics.set(prefix, current + 1);
  }

  /**
   * Get cache hit rate for a specific prefix
   */
  getCacheHitRate(prefix: string): number {
    const hits = this.cacheHitMetrics.get(prefix) || 0;
    const misses = this.cacheMissMetrics.get(prefix) || 0;
    
    if (hits + misses === 0) {
      return 0;
    }
    
    return hits / (hits + misses);
  }

  /**
   * Get all cache metrics
   */
  getCacheMetrics(): Record<string, { hits: number; misses: number; hitRate: number }> {
    const metrics: Record<string, { hits: number; misses: number; hitRate: number }> = {};
    
    // Combine all unique prefixes
    const prefixes = new Set([
      ...Array.from(this.cacheHitMetrics.keys()),
      ...Array.from(this.cacheMissMetrics.keys()),
    ]);
    
    for (const prefix of prefixes) {
      const hits = this.cacheHitMetrics.get(prefix) || 0;
      const misses = this.cacheMissMetrics.get(prefix) || 0;
      const hitRate = hits + misses === 0 ? 0 : hits / (hits + misses);
      
      metrics[prefix] = { hits, misses, hitRate };
    }
    
    return metrics;
  }

  /**
   * Reset cache metrics
   */
  resetCacheMetrics(): void {
    this.cacheHitMetrics.clear();
    this.cacheMissMetrics.clear();
  }
} 