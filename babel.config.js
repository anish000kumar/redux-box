module.exports = api => {
  const isTest = api.env('test');
  api.cache.using(() => isTest);

  const loose = true;

  return {
    presets: [
      ['@babel/preset-env', { loose, modules: 'commonjs' }],
      '@babel/preset-react',
    ],
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['@babel/plugin-transform-runtime', { useESModules: false }],
    ],
  };
};
