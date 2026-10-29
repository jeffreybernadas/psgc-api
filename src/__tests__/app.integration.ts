import { Server } from 'http';
import { AddressInfo } from 'net';
import app from '../app';
import { OK, NOT_FOUND } from '../constants/http.constant';

jest.mock('../configs/redis.config', () => {
  const fakeRedis = () => ({
    get: jest.fn().mockResolvedValue(null),
    setex: jest.fn().mockResolvedValue('OK'),
    incr: jest.fn().mockResolvedValue(1),
    ttl: jest.fn().mockResolvedValue(600),
  });
  return {
    redisClient: fakeRedis(),
    rateLimitRedis: fakeRedis(),
    CACHE_TTL: 3600,
    RATE_LIMIT_WINDOW: 600,
    RATE_LIMIT: { BARANGAY_LIST: 1, DEFAULT: 25 },
  };
});

jest.mock('../utils/logger.util', () => ({
  logger: { info: jest.fn(), error: jest.fn() },
}));

// Runs against the generated data in public/api.
describe('App: routes against the published data', () => {
  let server: Server;
  let baseUrl: string;

  const get = (urlPath: string) => fetch(`${baseUrl}${urlPath}`);
  const getJson = async (urlPath: string) => {
    const response = await get(urlPath);
    return { status: response.status, body: await response.json() };
  };

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => resolve());
    });
    const { port } = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('should report healthy', async () => {
    const { status, body } = await getJson('/health');

    expect(status).toBe(OK);
    expect(body).toEqual({ status: 'PSGC API is healthy.' });
  });

  it('should serve the landing page', async () => {
    const response = await get('/');

    expect(response.status).toBe(OK);
    expect(await response.text()).toContain('PSGC API');
  });

  it('should serve the OpenAPI spec and the Swagger UI', async () => {
    const spec = await getJson('/swagger.json');
    const explorer = await get('/explorer/');

    expect(spec.status).toBe(OK);
    expect(spec.body.paths).toBeDefined();
    expect(explorer.status).toBe(OK);
  });

  it('should list all 18 regions', async () => {
    const { status, body } = await getJson('/api/v1/region?limit=50');

    expect(status).toBe(OK);
    expect(body.total).toBe(18);
  });

  it('should list Sulu under Region IX and not under BARMM', async () => {
    const regionIX = await getJson('/api/v1/region/0900000000/provinces');
    const barmm = await getJson('/api/v1/region/1900000000/provinces');

    const names = (body: { data: { name: string }[] }) =>
      body.data.map(({ name }) => name);

    expect(names(regionIX.body)).toContain('Sulu');
    expect(names(barmm.body)).not.toContain('Sulu');
  });

  it('should return both population counts for a province', async () => {
    const { status, body } = await getJson('/api/v1/province/0906600000');

    expect(status).toBe(OK);
    expect(body.data[0]).toMatchObject({
      name: 'Sulu',
      regionCode: '0900000000',
      population2020: expect.any(Number),
      population2024: expect.any(Number),
    });
  });

  it('should answer on every resource route', async () => {
    const routes = [
      '/api/v1/city/0431200000',
      '/api/v1/municipality/1102324000',
      '/api/v1/cityMunicipality/0431200000',
      '/api/v1/submunicipality/1380601000',
      '/api/v1/barangay/0401007019',
    ];

    for (const route of routes) {
      const { status, body } = await getJson(route);
      expect({ route, status, total: body.total }).toEqual({
        route,
        status: OK,
        total: 1,
      });
    }
  });

  it('should return 404 for a code that no longer exists', async () => {
    const { status } = await getJson('/api/v1/barangay/0401007038');

    expect(status).toBe(NOT_FOUND);
  });
});
