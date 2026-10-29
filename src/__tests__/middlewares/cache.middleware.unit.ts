import { Request, Response, NextFunction } from 'express';
import { cacheMiddleware } from '../../middlewares/cache.middleware';
import { redisClient } from '../../configs/redis.config';
import { mockRegion } from '../helpers/data';

jest.mock('../../configs/redis.config', () => ({
  redisClient: {
    get: jest.fn(),
    setex: jest.fn(),
  },
  CACHE_TTL: 3600,
}));

const mockedRedis = redisClient as unknown as {
  get: jest.Mock;
  setex: jest.Mock;
};

const responseBody = {
  page: 1,
  limit: 10,
  total: 1,
  data: mockRegion,
};

describe('Middleware: cacheMiddleware()', () => {
  let mockRequest: Request;
  let mockResponse: Response;
  let originalJson: jest.Mock;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    originalJson = jest.fn();
    mockRequest = { originalUrl: '/api/v1/region' } as Request;
    mockResponse = { json: originalJson } as unknown as Response;
    mockNext = jest.fn();
  });

  it('should return the cached response without calling the controller', async () => {
    mockedRedis.get.mockResolvedValue(JSON.stringify(responseBody));

    await cacheMiddleware('region_list')(mockRequest, mockResponse, mockNext);

    expect(mockedRedis.get).toHaveBeenCalledWith('region_list:/api/v1/region');
    expect(originalJson).toHaveBeenCalledWith(responseBody);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should cache the controller response for the default TTL on a miss', async () => {
    mockedRedis.get.mockResolvedValue(null);

    await cacheMiddleware('region_list')(mockRequest, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
    expect(mockResponse.json).not.toBe(originalJson);

    mockResponse.json(responseBody);

    expect(mockedRedis.setex).toHaveBeenCalledWith(
      'region_list:/api/v1/region',
      3600,
      JSON.stringify(responseBody),
    );
    expect(originalJson).toHaveBeenCalledWith(responseBody);
    expect(mockResponse.json).toBe(originalJson);
  });

  it('should use a custom TTL when one is given', async () => {
    mockedRedis.get.mockResolvedValue(null);

    await cacheMiddleware('region', 60)(mockRequest, mockResponse, mockNext);
    mockResponse.json(responseBody);

    expect(mockedRedis.setex).toHaveBeenCalledWith(
      'region:/api/v1/region',
      60,
      JSON.stringify(responseBody),
    );
  });

  it('should pass the error on when Redis fails', async () => {
    const redisError = new Error('Redis is down');
    mockedRedis.get.mockRejectedValue(redisError);

    await cacheMiddleware('region_list')(mockRequest, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalledWith(redisError);
    expect(originalJson).not.toHaveBeenCalled();
  });
});
