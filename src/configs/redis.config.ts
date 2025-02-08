import Redis from 'ioredis';

const REDIS_CONFIG = {
  host: process.env.REDIS_HOST ?? 'localhost',
  port: parseInt(process.env.REDIS_PORT ?? '6379'),
  password: process.env.REDIS_PASSWORD ?? '',
  username: process.env.REDIS_USERNAME ?? '',
  db: parseInt(process.env.REDIS_DB ?? '0'),
};

// Redis client for caching
export const redisClient = new Redis(REDIS_CONFIG);

// Separate Redis client for rate limiting to avoid conflicts
export const rateLimitRedis = new Redis(REDIS_CONFIG);

// Cache TTL in seconds (1 hour)
export const CACHE_TTL = 3600;

// Rate limit window in seconds (10 minutes)
export const RATE_LIMIT_WINDOW = 600;

// Rate limit attempts
export const RATE_LIMIT = {
  BARANGAY_LIST: 1, // 1 request per 10 minutes for /barangay endpoint
  DEFAULT: 25, // 25 requests per 10 minutes for other endpoints
};
