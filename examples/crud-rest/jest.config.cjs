const path = require('path');

/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: ['<rootDir>/tests/**/*.test.{ts,tsx}'],
  // Reset mock state AND implementations between tests so a previous
  // test's `mockResolvedValue` cannot bleed into the next.
  resetMocks: true,
  // Force every `react`, `react-dom` and `react-redux` import to resolve
  // to this example's `node_modules`. When `redux-box` is linked via
  // `file:../..` the linked package gets its own copy of React inside
  // the parent repo's `node_modules`, and react-redux's hooks throw
  // "useMemo of null" when two copies are loaded into the same render.
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
