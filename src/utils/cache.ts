import NodeCache from 'node-cache';
import { logger } from './logger';

class CacheService {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({
      stdTTL: 300, // 5 minutes default TTL (in seconds)
      checkperiod: 120, // Check for expired keys every 2 minutes
      useClones: false, // Don't clone objects for better performance
      deleteOnExpire: true,
      maxKeys: 1000, // Limit cache size
      errorOnMissing: false
    });

    this.cache.on('set', (key: string) => {
      logger.debug(`Cache SET: ${key}`);
    });

    this.cache.on('get', (key: string) => {
      logger.debug(`Cache HIT: ${key}`);
    });

    this.cache.on('del', (key: string) => {
      logger.debug(`Cache DELETE: ${key}`);
    });

    this.cache.on('expired', (key: string) => {
      logger.debug(`Cache EXPIRED: ${key}`);
    });

    this.cache.on('flush', () => {
      logger.info('Cache flushed');
    });
  }

  get<T>(key: string): T | undefined {
    const value = this.cache.get<T>(key);
    if (value === undefined) {
      logger.debug(`Cache MISS: ${key}`);
    }
    return value;
  }

  set<T>(key: string, value: T, ttlSeconds?: number): boolean {
    const success = this.cache.set(key, value, ttlSeconds || 300);
    if (success) {
      logger.debug(`Cache SET: ${key} (TTL: ${ttlSeconds || 300}s)`);
    }
    return success;
  }

  del(key: string): boolean {
    const success = this.cache.del(key) > 0;
    logger.debug(`Cache DELETE: ${key} ${success ? 'SUCCESS' : 'NOT_FOUND'}`);
    return success;
  }

  flush(): void {
    this.cache.flushAll();
    logger.info('Cache flushed');
  }

  clearByPattern(pattern: string): number {
    const keys = this.cache.keys();
    let cleared = 0;
    
    for (const key of keys) {
      if (key.includes(pattern)) {
        this.cache.del(key);
        cleared++;
      }
    }
    
    logger.debug(`Cache CLEAR_PATTERN: ${pattern} - cleared ${cleared} keys`);
    return cleared;
  }

  getStats() {
    const stats = this.cache.getStats();
    return {
      keys: stats.keys,
      hits: stats.hits,
      misses: stats.misses,
      ksize: stats.ksize,
      vsize: stats.vsize
    };
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  keys(): string[] {
    return this.cache.keys();
  }

  getTtl(key: string): number | undefined {
    return this.cache.getTtl(key);
  }

  updateTtl(key: string, ttl: number): boolean {
    return this.cache.ttl(key, ttl);
  }

  mget<T>(keys: string[]): { [key: string]: T } {
    return this.cache.mget(keys);
  }

  mset<T>(keyValuePairs: Array<{ key: string; val: T; ttl?: number }>): boolean {
    return this.cache.mset(keyValuePairs);
  }


  static generateProductKey(page: number = 1, limit: number = 10, filters?: any): string {
    const filterStr = filters ? JSON.stringify(filters) : '';
    return `products:page:${page}:limit:${limit}:filters:${filterStr}`;
  }

  static generateSingleProductKey(productId: string): string {
    return `product:${productId}`;
  }

  static generateUserKey(userId: string): string {
    return `user:${userId}`;
  }

  static generateLowStockKey(): string {
    return 'products:low-stock';
  }

  static generateAuthKey(userId: string): string {
    return `auth:${userId}`;
  }

  static generateSearchKey(query: string, page: number = 1, limit: number = 10): string {
    return `search:${query}:page:${page}:limit:${limit}`;
  }
}

export const cacheService = new CacheService();
export { CacheService };