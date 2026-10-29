import Redis from 'ioredis';

jest.mock('ioredis', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const MockedRedis = Redis as unknown as jest.Mock;

const REDIS_ENV = [
  'REDIS_HOST',
  'REDIS_PORT',
  'REDIS_PASSWORD',
  'REDIS_USERNAME',
  'REDIS_DB',
];

type RedisOptions = {
  host: string;
  port: number;
  password: string;
  username: string;
  db: number;
  retryStrategy: (times: number) => number;
  reconnectOnError: (err: Error) => boolean;
};

const loadConfig = async () => {
  let config!: typeof import('../../configs/redis.config');
  await jest.isolateModulesAsync(async () => {
    config = await import('../../configs/redis.config');
  });
  return config;
};

const lastOptions = (): RedisOptions =>
  MockedRedis.mock.calls[MockedRedis.mock.calls.length - 1][0];

describe('Config: redis.config', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    MockedRedis.mockClear();
    REDIS_ENV.forEach((key) => delete process.env[key]);
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should create separate clients for caching and rate limiting', async () => {
    const config = await loadConfig();

    expect(MockedRedis).toHaveBeenCalledTimes(2);
    expect(config.redisClient).not.toBe(config.rateLimitRedis);
  });

  it('should fall back to local defaults when no env is set', async () => {
    await loadConfig();

    expect(lastOptions()).toMatchObject({
      host: 'localhost',
      port: 6379,
      password: '',
      username: '',
      db: 0,
      maxRetriesPerRequest: 3,
      enableReadyCheck: false,
    });
  });

  it('should read the connection from env', async () => {
    process.env.REDIS_HOST = 'redis.internal';
    process.env.REDIS_PORT = '6380';
    process.env.REDIS_PASSWORD = 'secret';
    process.env.REDIS_USERNAME = 'psgc';
    process.env.REDIS_DB = '2';

    await loadConfig();

    expect(lastOptions()).toMatchObject({
      host: 'redis.internal',
      port: 6380,
      password: 'secret',
      username: 'psgc',
      db: 2,
    });
  });

  it('should back off between retries, capped at 2 seconds', async () => {
    await loadConfig();
    const { retryStrategy } = lastOptions();

    expect(retryStrategy(1)).toBe(50);
    expect(retryStrategy(10)).toBe(500);
    expect(retryStrategy(100)).toBe(2000);
  });

  it('should reconnect only on READONLY errors', async () => {
    await loadConfig();
    const { reconnectOnError } = lastOptions();

    expect(reconnectOnError(new Error('READONLY You cannot write'))).toBe(true);
    expect(reconnectOnError(new Error('Connection reset'))).toBe(false);
  });

  it('should export the cache and rate limit settings', async () => {
    const config = await loadConfig();

    expect(config.CACHE_TTL).toBe(3600);
    expect(config.RATE_LIMIT_WINDOW).toBe(600);
    expect(config.RATE_LIMIT).toEqual({ BARANGAY_LIST: 1, DEFAULT: 25 });
  });
});
