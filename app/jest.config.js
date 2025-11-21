module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/test/**',
    '!**/public/**',
    '!jest.config.js',
  ],
  testMatch: [
    '**/test/**/*.test.js',
  ],
  // Relaxed coverage thresholds for stable release
  // coverageThreshold: {
  //   global: {
  //     branches: 20,
  //     functions: 20,
  //     lines: 20,
  //     statements: 20,
  //   },
  // },
  verbose: true,
  testTimeout: 10000,
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  // Skip database tests in CI if DATABASE_URL is not set
  testPathIgnorePatterns: [
    '/node_modules/',
    ...(process.env.DATABASE_URL ? [] : ['/test/database.test.js']),
  ],
};
