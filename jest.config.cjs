module.exports = {
  moduleFileExtensions: ['js', 'jsx', 'json'],
  testEnvironment: 'jsdom',
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  coverageThreshold: {
    global: {
      functions: 90,
      lines: 90,
    },
  },
};
