import { Controller, Get, Inject, Post, Body, Delete, Param, UseGuards } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Roles, UserRole } from '../common/guards/roles.guard';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { NoCache } from './decorators/cache.decorators';

@ApiTags('cache')
@Controller('cache')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class CacheController {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  @Get('metrics')
  @NoCache()
  @ApiOperation({ summary: 'Get cache metrics', description: 'Get cache hit/miss metrics (admin only)' })
  @ApiResponse({ status: 200, description: 'Cache metrics retrieved successfully' })
  async getMetrics() {
    return {
      message: 'Cache metrics are not available with the default cache manager',
    };
  }

  @Get(':key')
  @NoCache()
  @ApiOperation({ summary: 'Get cache value', description: 'Get a value from cache by key (admin only)' })
  @ApiParam({ name: 'key', description: 'Cache key' })
  @ApiResponse({ status: 200, description: 'Cache value retrieved successfully' })
  async getCacheValue(@Param('key') key: string) {
    const value = await this.cacheManager.get(key);
    return {
      key,
      value: value || null,
    };
  }

  @Post()
  @NoCache()
  @ApiOperation({ summary: 'Set cache value', description: 'Set a value in cache (admin only)' })
  @ApiResponse({ status: 200, description: 'Cache value set successfully' })
  async setCacheValue(@Body() body: { key: string; value: any; ttl?: number }) {
    const { key, value, ttl } = body;
    await this.cacheManager.set(key, value, ttl);
    return {
      message: `Cache value for key '${key}' set successfully`,
    };
  }

  @Delete(':key')
  @NoCache()
  @ApiOperation({ summary: 'Delete cache value', description: 'Delete a value from cache by key (admin only)' })
  @ApiParam({ name: 'key', description: 'Cache key' })
  @ApiResponse({ status: 200, description: 'Cache value deleted successfully' })
  async deleteCacheValue(@Param('key') key: string) {
    await this.cacheManager.del(key);
    return {
      message: `Cache value for key '${key}' deleted successfully`,
    };
  }

  @Delete()
  @NoCache()
  @ApiOperation({ summary: 'Clear cache', description: 'Clear all cache entries (admin only)' })
  @ApiResponse({ status: 200, description: 'Cache cleared successfully' })
  async clearCache() {
    // Note: cache-manager v5+ doesn't have a reset method
    // We would need to implement a custom solution to clear all keys
    return {
      message: 'Cache clear operation is not available with the default cache manager',
    };
  }

  @Get('hit-rate/:prefix')
  @NoCache()
  @ApiOperation({ summary: 'Get cache hit rate', description: 'Get cache hit rate for a specific prefix (admin only)' })
  @ApiParam({ name: 'prefix', description: 'Cache key prefix' })
  @ApiResponse({ status: 200, description: 'Cache hit rate retrieved successfully' })
  async getHitRate(@Param('prefix') prefix: string) {
    // Note: Hit rate metrics are not available with the default cache manager
    return {
      prefix,
      message: 'Hit rate metrics are not available with the default cache manager',
    };
  }

  @Delete('metrics')
  @NoCache()
  @ApiOperation({ summary: 'Reset cache metrics', description: 'Reset cache hit/miss metrics (admin only)' })
  @ApiResponse({ status: 200, description: 'Cache metrics reset successfully' })
  async resetMetrics() {
    return {
      message: 'Cache metrics reset operation is not available with the default cache manager',
    };
  }

  @Delete('prefix/:prefix')
  @NoCache()
  @ApiOperation({ summary: 'Invalidate cache by prefix', description: 'Invalidate all cache entries with a specific prefix (admin only)' })
  @ApiParam({ name: 'prefix', description: 'Cache key prefix' })
  @ApiResponse({ status: 200, description: 'Cache invalidated successfully' })
  async invalidateByPrefix(@Param('prefix') prefix: string) {
    // Note: Prefix-based invalidation is not available with the default cache manager
    // We would need to implement a custom solution to find and delete keys by prefix
    return {
      message: `Cache invalidation by prefix is not available with the default cache manager`,
    };
  }
} 