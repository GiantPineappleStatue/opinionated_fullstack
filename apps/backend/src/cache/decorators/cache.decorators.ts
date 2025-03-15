import { SetMetadata } from '@nestjs/common';

/**
 * Custom decorator to exclude a route from caching
 */
export const NoCache = () => SetMetadata('no-cache', true);

/**
 * Custom decorator to set a custom cache key for a route
 */
export const CacheKey = (key: string) => SetMetadata('cache-key', key);

/**
 * Custom decorator to set a custom TTL for a route
 * @param ttl Time to live in seconds
 */
export const CacheTTL = (ttl: number) => SetMetadata('cache-ttl', ttl); 