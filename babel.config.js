module.exports = api => {
  const isTest = api.env('test');
  api.cache.using(() => isTest);

  const loose = true;

  return {
    presets: [
      ['@babel/preset-env', { loose, modules: 'commonjs' }],
      '@babel/preset-react',
      '@babel/preset-typescript',
    ],
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      // NB: deliberately *not* using `@babel/plugin-transform-runtime` here.
      // That plugin replaces helpers with `require('@babel/runtime/...')`
      // calls, which forces every consumer (including the example apps that
      // link to redux-box via `file:../..`) to resolve `@babel/runtime` from
      // the dist's physical location. With the example using a symlink,
      // Node resolves from the link target (the repo root) which has no
      // `node_modules/` in the CI artefact-only flow — so the require
      // fails. Letting Babel inline the tiny helpers (a few hundred bytes
      // total) sidesteps the whole resolution dance and removes
      // `@babel/runtime` from the package's runtime dependency surface.
    ],
  };
};
