import { Request, Response, NextFunction } from 'express';
import { TOO_MANY_REQUESTS } from '../constants/http.constant';
import {
  rateLimitRedis,
  RATE_LIMIT_WINDOW,
  RATE_LIMIT,
} from '../configs/redis.config';

/**
 * Rate limiting middleware using Redis
 * @param endpoint - The endpoint type to determine rate limit ('barangay_list' or 'default')
 */
export const rateLimitMiddleware = (
  endpoint: keyof typeof RATE_LIMIT = 'DEFAULT',
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const ip = req.ip;
      const key = `ratelimit:${endpoint}:${ip}`;

      // Get the current count for this IP
      const currentCount = await rateLimitRedis.get(key);
      const maxAttempts = RATE_LIMIT[endpoint];

      if (currentCount && parseInt(currentCount) >= maxAttempts) {
        // Rate limit exceeded
        const ttl = await rateLimitRedis.ttl(key);
        res.status(TOO_MANY_REQUESTS).json({
          error: true,
          message: `Too many requests. Try again in ${Math.ceil(
            ttl / 60,
          )} minutes.`,
          status: TOO_MANY_REQUESTS,
        });
        return;
      }

      // First request in window
      if (!currentCount) {
        await rateLimitRedis.setex(key, RATE_LIMIT_WINDOW, 1);
      } else {
        // Increment the counter
        await rateLimitRedis.incr(key);
      }

      next();
    } catch (error) {
      // If Redis fails, allow the request
      next(error);
    }
  };
};
