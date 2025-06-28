module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/../test/setup.ts'],
  globalTeardown: '<rootDir>/../test/teardown.ts',
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapper: {
    '^@config/(.*)$': '<rootDir>/config/$1',
  },
  forceExit: true,
  detectOpenHandles: true,
  testTimeout: 30000,
};
