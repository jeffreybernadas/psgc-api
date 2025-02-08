module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/__tests__'],
  modulePathIgnorePatterns: ['<rootDir>/src/__tests__/helpers/*'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  setupFiles: ['<rootDir>/src/__tests__/helpers/setupTest.ts'],
  testRegex: '(/__tests__/.*|(\\.|/)(unit|integration|acceptance))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: ['src/**/*.ts'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/',
    '/src/scripts/',
    '/src/utils/logger.util.ts',
  ],
};
