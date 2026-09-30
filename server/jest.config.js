export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': ['@swc/jest', {
      sourceMaps: true,
      module: {
        type: 'es6',
      },
    }],
  },
  transformIgnorePatterns: [],
  moduleNameMapper: {
    '^face-api.js$': '<rootDir>/tests/mocks/face-api.js',
    '^canvas$': '<rootDir>/tests/mocks/canvas.js',
  },
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true,
};
