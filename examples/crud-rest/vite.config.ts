import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `VITE_BASE_PATH` is read at build time so the same config can produce
// either a root-served bundle (local `npm run dev` / `npm run preview`)
// or a sub-path bundle for GitHub Pages, where the deployed site lives
// at `/redux-box/examples/crud-rest/`.
const base = process.env.VITE_BASE_PATH || '/';

export default defineConfig({
  base,
  plugins: [react()],
  server: { port: 5173 },
  // `redux-box` ships a CommonJS bundle (`dist/index.js`); pre-bundle it
  // with esbuild so the production Rollup pass sees idiomatic ESM exports
  // (`createStore`, `createSagas`, …) instead of `exports.foo = …` lines
  // that Rollup's named-export analyser can't always resolve.
  optimizeDeps: {
    include: ['redux-box'],
  },
  build: {
    commonjsOptions: {
      include: [/redux-box/, /node_modules/],
      transformMixedEsModules: true,
    },
  },
});
