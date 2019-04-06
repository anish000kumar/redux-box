module.exports = {
  moduleFileExtensions: ['js', 'jsx', 'json'],
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  transform: {
    '.js$': `${__dirname}/babel-transformer.jest.js`,
  },
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: -10,
    },
  },
};
