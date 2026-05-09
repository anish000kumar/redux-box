import { defaultTheme } from '@vuepress/theme-default';
import { webpackBundler } from '@vuepress/bundler-webpack';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { sidebarTree } = require('../api/config.js');

export default {
  bundler: webpackBundler(),
  base: process.env.DOCS_BASE || '/',
  title: 'Redux Box',
  description: 'Container for redux applications',
  theme: defaultTheme({
    sidebarDepth: 4,
    docsDir: 'docs',
    editLink: true,
    sidebar: {
      '/': [
        { text: 'Getting Started', link: '/getting-started.html' },
        { text: 'Creating a simple app', link: '/simple-example.html' },
        { text: 'Advanced example app', link: '/advanced-example.html' },
        { text: 'Recipes', link: '/recipes.html' },
        { text: 'Testing', link: '/testing-practises.html' },
      ],
      ...sidebarTree('Redux Box API'),
    },
    navbar: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/getting-started.html' },
      { text: 'API', link: '/api/' },
    ],
  }),
};
