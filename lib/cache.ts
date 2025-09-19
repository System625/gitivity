/**
 * High-performance in-memory cache optimized for Vercel serverless functions
 * Uses LRU eviction and time-based expiration
 */

interface CacheEntry<T> {
  value: T
  expires: number
  lastAccessed: number
}

interface CacheStats {
  hits: number
  misses: number
  sets: number
  deletes: number
  evictions: number
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>()
  private maxSize: number
  private defaultTtl: number
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0
  }

  constructor(maxSize = 1000, defaultTtlSeconds = 300) {
    this.maxSize = maxSize
    this.defaultTtl = defaultTtlSeconds * 1000 // Convert to milliseconds
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      this.stats.misses++
      return null
    }

    const now = Date.now()

    // Check if expired
    if (now > entry.expires) {
      this.cache.delete(key)
      this.stats.misses++
      return null
    }

    // Update last accessed time for LRU
    entry.lastAccessed = now
    this.stats.hits++

    return entry.value as T
  }

  /**
   * Set value in cache
   */
  set<T>(key: string, value: T, ttlSeconds?: number): void {
    const now = Date.now()
    const ttl = ttlSeconds ? ttlSeconds * 1000 : this.defaultTtl

    // If cache is full, evict LRU item
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU()
    }

    this.cache.set(key, {
      value,
      expires: now + ttl,
      lastAccessed: now
    })

    this.stats.sets++
  }

  /**
   * Delete value from cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    if (deleted) {
      this.stats.deletes++
    }
    return deleted
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    const now = Date.now()
    if (now > entry.expires) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.cache.clear()
    this.stats = { hits: 0, misses: 0, sets: 0, deletes: 0, evictions: 0 }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats & { size: number; hitRate: number } {
    const total = this.stats.hits + this.stats.misses
    const hitRate = total > 0 ? this.stats.hits / total : 0

    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: Math.round(hitRate * 100) / 100
    }
  }

  /**
   * Evict least recently used item
   */
  private evictLRU(): void {
    let oldestKey: string | null = null
    let oldestTime = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
      this.stats.evictions++
    }
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    const now = Date.now()
    let cleaned = 0

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.cache.delete(key)
        cleaned++
      }
    }

    return cleaned
  }
}

// Global cache instances for different data types
const globalCache = new MemoryCache(1000, 300) // 5 minutes default TTL
const profileCache = new MemoryCache(500, 1800) // 30 minutes for profiles
const leaderboardCache = new MemoryCache(10, 300) // 5 minutes for leaderboards

// Cache key generators
export const CacheKeys = {
  profile: (username: string) => `profile:${username.toLowerCase()}`,
  userRank: (username: string, score: number) => `rank:${username.toLowerCase()}:${score}`,
  leaderboard: (limit: number = 100) => `leaderboard:${limit}`,
  githubData: (username: string) => `github:${username.toLowerCase()}`,
  totalUsers: () => 'stats:total_users'
}

// Exported cache functions
export const cache = {
  // Profile caching
  getProfile: <T>(username: string): T | null =>
    profileCache.get<T>(CacheKeys.profile(username)),

  setProfile: <T>(username: string, data: T, ttlSeconds = 1800): void =>
    profileCache.set(CacheKeys.profile(username), data, ttlSeconds),

  deleteProfile: (username: string): boolean =>
    profileCache.delete(CacheKeys.profile(username)),

  // Rank caching
  getUserRank: (username: string, score: number) =>
    globalCache.get<{ rank: number; totalUsers: number }>(CacheKeys.userRank(username, score)),

  setUserRank: (username: string, score: number, rankData: { rank: number; totalUsers: number }, ttlSeconds = 300) =>
    globalCache.set(CacheKeys.userRank(username, score), rankData, ttlSeconds),

  // Leaderboard caching
  getLeaderboard: <T>(limit = 100): T | null =>
    leaderboardCache.get<T>(CacheKeys.leaderboard(limit)),

  setLeaderboard: <T>(data: T, limit = 100, ttlSeconds = 300): void =>
    leaderboardCache.set(CacheKeys.leaderboard(limit), data, ttlSeconds),

  // GitHub data caching
  getGithubData: <T>(username: string): T | null =>
    globalCache.get<T>(CacheKeys.githubData(username)),

  setGithubData: <T>(username: string, data: T, ttlSeconds = 600): void =>
    globalCache.set(CacheKeys.githubData(username), data, ttlSeconds),

  // Total users caching
  getTotalUsers: (): number | null =>
    globalCache.get<number>(CacheKeys.totalUsers()),

  setTotalUsers: (count: number, ttlSeconds = 300): void =>
    globalCache.set(CacheKeys.totalUsers(), count, ttlSeconds),

  // Cache management
  invalidateUser: (username: string): void => {
    profileCache.delete(CacheKeys.profile(username))
    globalCache.delete(CacheKeys.githubData(username))
    // Clear all rank caches for this user (we don't know the score)
    for (const key of Array.from(globalCache['cache'].keys())) {
      if (key.startsWith(`rank:${username.toLowerCase()}:`)) {
        globalCache.delete(key)
      }
    }
    // Clear totalUsers cache as the count may have changed
    globalCache.delete(CacheKeys.totalUsers())
    // Clear leaderboard cache as rankings may have changed
    leaderboardCache.clear()
  },

  clearLeaderboard: (): void => {
    leaderboardCache.clear()
  },

  clearAll: (): void => {
    globalCache.clear()
    profileCache.clear()
    leaderboardCache.clear()
  },

  // Get cache statistics
  getStats: () => ({
    global: globalCache.getStats(),
    profiles: profileCache.getStats(),
    leaderboard: leaderboardCache.getStats()
  }),

  // Cleanup expired entries
  cleanup: () => ({
    global: globalCache.cleanup(),
    profiles: profileCache.cleanup(),
    leaderboard: leaderboardCache.cleanup()
  })
}

// Periodic cleanup (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    cache.cleanup()
  }, 5 * 60 * 1000)
}