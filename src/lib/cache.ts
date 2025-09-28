import Redis from 'ioredis';

// Redis client for caching
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  enableOfflineQueue: false,
});

// Handle Redis connection errors gracefully
redis.on('error', (err) => {
  console.warn('Redis connection error:', err.message);
});

redis.on('connect', () => {
  console.log('Redis connected successfully');
});

if (process.env.NODE_ENV === 'production' && !process.env.REDIS_URL) {
  console.warn('Redis not configured for production environment');
}

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.warn('Cache get error, falling back to no cache:', error);
      return null;
    }
  },

  async set(key: string, value: any, ttl: number = 300): Promise<void> {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.warn('Cache set error, continuing without cache:', error);
    }
  },

  async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      console.warn('Cache del error:', error);
    }
  },

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.warn('Cache invalidate pattern error:', error);
    }
  }
};

// Cache key generators
export const cacheKeys = {
  projects: () => 'projects:all',
  projectsWithVotes: () => 'projects:with-votes',
  userVotes: (userId: string) => `user:${userId}:votes`,
  userProjects: (userId: string) => `user:${userId}:projects`,
  projectDetails: (projectId: string) => `project:${projectId}:details`,
  leaderboard: () => 'leaderboard:top',
};
