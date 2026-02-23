/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * In-memory file-stat cache
 * TTL-based cache keyed by file path; invalidates when mtime changes.
 */

import { statSync } from 'node:fs';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  mtime?: number; // for file-based invalidation
}

export interface CacheStats {
  size: number;
  keys: string[];
  hits: number;
  misses: number;
  hitRate: number;
}

/**
 * Cache configuration
 */
export const CACHE_CONFIG = {
  PROJECT_MD_TTL: 60 * 60 * 1000, // 1 hour
  PACKAGE_ANALYSIS_TTL: 30 * 60 * 1000, // 30 minutes
  ITEM_COUNTS_TTL: 5 * 60 * 1000, // 5 minutes
  RECENT_UPDATES_TTL: 1 * 60 * 1000, // 1 minute
  MAX_CACHE_SIZE: 1000, // Maximum number of cache entries
};

/**
 * Smart context cache with TTL and file-based invalidation
 */
export class ContextCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private hits = 0;
  private misses = 0;

  /**
   * Get cached value
   * @param key Cache key
   * @param maxAge Maximum age in milliseconds
   * @param filePath Optional file path for mtime-based invalidation
   * @returns Cached value or null if invalid/expired
   */
  get<T>(key: string, maxAge: number, filePath?: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // Check file modification time
    if (filePath && entry.mtime !== undefined) {
      try {
        const currentMtime = statSync(filePath).mtimeMs;
        if (currentMtime > entry.mtime) {
          this.cache.delete(key);
          this.misses++;
          return null;
        }
      } catch {
        // File doesn't exist anymore, invalidate cache
        this.cache.delete(key);
        this.misses++;
        return null;
      }
    }

    // Check TTL
    if (Date.now() - entry.timestamp > maxAge) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry.data as T;
  }

  /**
   * Set cached value
   * @param key Cache key
   * @param data Data to cache
   * @param filePath Optional file path for mtime tracking
   */
  set<T>(key: string, data: T, filePath?: string): void {
    // Enforce max cache size (simple LRU: remove oldest)
    if (this.cache.size >= CACHE_CONFIG.MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    let mtime: number | undefined;
    if (filePath) {
      try {
        mtime = statSync(filePath).mtimeMs;
      } catch {
        // File doesn't exist, don't track mtime
        mtime = undefined;
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      mtime,
    });
  }

  /**
   * Check if key exists and is valid
   * @param key Cache key
   * @param maxAge Maximum age in milliseconds
   * @param filePath Optional file path for mtime-based invalidation
   * @returns true if valid cached value exists
   */
  has(key: string, maxAge: number, filePath?: string): boolean {
    return this.get(key, maxAge, filePath) !== null;
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Clear specific cache key
   * @param key Cache key to clear
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear cache entries matching pattern
   * @param pattern Regex pattern to match keys
   */
  clearPattern(pattern: RegExp): number {
    let cleared = 0;
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        cleared++;
      }
    }
    return cleared;
  }

  /**
   * Get cache statistics
   * @returns Cache statistics including hit rate
   */
  stats(): CacheStats {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? this.hits / total : 0;

    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      hits: this.hits,
      misses: this.misses,
      hitRate: Math.round(hitRate * 100) / 100,
    };
  }

  /**
   * Reset hit/miss counters
   */
  resetStats(): void {
    this.hits = 0;
    this.misses = 0;
  }
}

// Global singleton instance
let globalCache: ContextCache | null = null;

/**
 * Get or create global cache instance
 */
export function getCache(): ContextCache {
  if (!globalCache) {
    globalCache = new ContextCache();
  }
  return globalCache;
}

/**
 * Clear global cache
 */
export function clearGlobalCache(): void {
  if (globalCache) {
    globalCache.clear();
  }
}
