const path = require('path');

/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: ['<rootDir>/tests/**/*.test.{ts,tsx}'],
  resetMocks: true,
  // Force every `react`, `react-dom` and `react-redux` import to resolve
  // to this example's `node_modules`. Linking `redux-box` via
  // `file:../..` would otherwise pull in a duplicate React from the
  // parent repo and trigger "useMemo of null" inside react-redux.
  moduleNameMapper: {
    '^react$': path.resolve(__dirname, 'node_modules/react'),
    '^react-dom$': path.resolve(__dirname, 'node_modules/react-dom'),
    '^react-dom/(.*)$': path.resolve(__dirname, 'node_modules/react-dom/$1'),
    '^react-redux$': path.resolve(__dirname, 'node_modules/react-redux'),
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/main.tsx',
    '!src/**/index.ts',
  ],
  coverageThreshold: {
    global: { branches: 70, functions: 80, lines: 85, statements: 85 },
  },
};
