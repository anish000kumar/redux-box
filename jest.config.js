module.exports = {
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  testEnvironment: 'jsdom',
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  // The example apps under /examples each have their own self-contained
  // Jest setup (different React/redux-box copies, different transforms).
  // Skip them when running the library's own test suite.
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/examples/',
  ],
  coverageThreshold: {
    global: {
      functions: 90,
      lines: 90,
    },
  },
};
