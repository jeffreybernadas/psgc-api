import { Request, Response, NextFunction } from 'express';
import { redisClient, CACHE_TTL } from '../configs/redis.config';
import {
  RegionResponse,
  ProvinceResponse,
  CityResponse,
  MunicipalityResponse,
  SubMunicipalityResponse,
  BarangayResponse,
  PaginatedResponse,
} from '../types/data.type';

// Type for all possible response data
type ResponseData =
  | RegionResponse
  | ProvinceResponse
  | CityResponse
  | MunicipalityResponse
  | SubMunicipalityResponse
  | BarangayResponse;

/**
 * Redis caching middleware
 * @param keyPrefix - Prefix for the Redis key (e.g., 'region', 'province')
 * @param ttl - Time to live in seconds (optional, defaults to CACHE_TTL)
 */
export const cacheMiddleware = (keyPrefix: string, ttl: number = CACHE_TTL) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // Create a unique cache key based on the request
      const cacheKey = `${keyPrefix}:${req.originalUrl}`;

      // Try to get cached response
      const cachedResponse = await redisClient.get(cacheKey);

      if (cachedResponse) {
        // If cache exists, return it
        res.json(JSON.parse(cachedResponse));
        return;
      }

      // If no cache, store the response
      const originalJson = res.json;
      res.json = ((data: PaginatedResponse<ResponseData>) => {
        // Store the response in Redis before sending
        redisClient.setex(cacheKey, ttl, JSON.stringify(data));

        // Restore original json method and call it
        res.json = originalJson;
        return res.json(data);
      }) as typeof res.json;

      next();
    } catch (error) {
      // If Redis fails, just continue without caching
      next(error);
    }
  };
};
