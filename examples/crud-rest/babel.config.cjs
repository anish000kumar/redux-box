/**
 * Babel config used by Jest. Vite handles its own transforms in dev/prod via
 * `@vitejs/plugin-react`, so this file is intentionally test-only.
 */
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript',
  ],
};
