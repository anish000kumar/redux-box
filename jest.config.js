module.exports = {
  moduleFileExtensions: ['js', 'jsx', 'json'],
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  transform: {
    '.js$': `${__dirname}/babel-transformer.jest.js`,
  },
  coverageThreshold: {
    global: {
      functions: 90,
      lines: 90,
    },
  },
};
