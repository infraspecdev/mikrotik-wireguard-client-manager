/** @type {import('ts-jest').JestConfigWithTsJest} **/
/* eslint-disable no-undef */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest",{}],
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/index.ts',
    '!**/node_modules/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
};
