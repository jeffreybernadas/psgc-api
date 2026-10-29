const loadVariables = async () => {
  let config!: typeof import('../../configs/variables.config');
  await jest.isolateModulesAsync(async () => {
    config = await import('../../configs/variables.config');
  });
  return config;
};

describe('Config: variables.config', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('should fall back to defaults when no env is set', async () => {
    delete process.env.PORT;
    delete process.env.NODE_ENV;
    delete process.env.TEST_ENV;

    const config = await loadVariables();

    expect(config.PORT).toBe(4000);
    expect(config.NODE_ENV).toBe('development');
    expect(config.TEST_ENV).toBe('test');
  });

  it('should read the values from env', async () => {
    process.env.PORT = '8080';
    process.env.NODE_ENV = 'production';
    process.env.TEST_ENV = 'ci';

    const config = await loadVariables();

    expect(config.PORT).toBe('8080');
    expect(config.NODE_ENV).toBe('production');
    expect(config.TEST_ENV).toBe('ci');
  });
});
