import { Request, Response, NextFunction } from 'express';
import { rateLimitMiddleware } from '../../middlewares/rateLimit.middleware';
import { rateLimitRedis } from '../../configs/redis.config';
import { TOO_MANY_REQUESTS } from '../../constants/http.constant';

jest.mock('../../configs/redis.config', () => ({
  rateLimitRedis: {
    get: jest.fn(),
    setex: jest.fn(),
    incr: jest.fn(),
    ttl: jest.fn(),
  },
  RATE_LIMIT_WINDOW: 600,
  RATE_LIMIT: {
    BARANGAY_LIST: 1,
    DEFAULT: 25,
  },
}));

const mockedRedis = rateLimitRedis as unknown as {
  get: jest.Mock;
  setex: jest.Mock;
  incr: jest.Mock;
  ttl: jest.Mock;
};

describe('Middleware: rateLimitMiddleware()', () => {
  const mockRequest = { ip: '203.0.113.7' } as Request;
  let mockResponse: Response;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    mockNext = jest.fn();
  });

  it('should start a new window on the first request', async () => {
    mockedRedis.get.mockResolvedValue(null);

    await rateLimitMiddleware('DEFAULT')(mockRequest, mockResponse, mockNext);

    expect(mockedRedis.get).toHaveBeenCalledWith(
      'ratelimit:DEFAULT:203.0.113.7',
    );
    expect(mockedRedis.setex).toHaveBeenCalledWith(
      'ratelimit:DEFAULT:203.0.113.7',
      600,
      1,
    );
    expect(mockedRedis.incr).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should use the default limit when no endpoint is given', async () => {
    mockedRedis.get.mockResolvedValue(null);

    await rateLimitMiddleware()(mockRequest, mockResponse, mockNext);

    expect(mockedRedis.get).toHaveBeenCalledWith(
      'ratelimit:DEFAULT:203.0.113.7',
    );
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should count requests that are under the limit', async () => {
    mockedRedis.get.mockResolvedValue('24');

    await rateLimitMiddleware('DEFAULT')(mockRequest, mockResponse, mockNext);

    expect(mockedRedis.incr).toHaveBeenCalledWith(
      'ratelimit:DEFAULT:203.0.113.7',
    );
    expect(mockedRedis.setex).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should block requests once the limit is reached', async () => {
    mockedRedis.get.mockResolvedValue('25');
    mockedRedis.ttl.mockResolvedValue(125);

    await rateLimitMiddleware('DEFAULT')(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(TOO_MANY_REQUESTS);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: true,
      message: 'Too many requests. Try again in 3 minutes.',
      status: TOO_MANY_REQUESTS,
    });
    expect(mockedRedis.incr).not.toHaveBeenCalled();
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should allow only one request per window for the barangay list', async () => {
    mockedRedis.get.mockResolvedValue('1');
    mockedRedis.ttl.mockResolvedValue(600);

    await rateLimitMiddleware('BARANGAY_LIST')(
      mockRequest,
      mockResponse,
      mockNext,
    );

    expect(mockedRedis.get).toHaveBeenCalledWith(
      'ratelimit:BARANGAY_LIST:203.0.113.7',
    );
    expect(mockResponse.status).toHaveBeenCalledWith(TOO_MANY_REQUESTS);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should pass the error on when Redis fails', async () => {
    const redisError = new Error('Redis is down');
    mockedRedis.get.mockRejectedValue(redisError);

    await rateLimitMiddleware('DEFAULT')(mockRequest, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalledWith(redisError);
    expect(mockResponse.status).not.toHaveBeenCalled();
  });
});
