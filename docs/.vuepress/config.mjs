import { defaultTheme } from '@vuepress/theme-default';
import { webpackBundler } from '@vuepress/bundler-webpack';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { sidebarTree } = require('../api/config.js');

export default {
  bundler: webpackBundler({
    // The default vuepress target list (es2020 + safari14) trips esbuild
    // >= 0.27 because the default theme's compiled `.vue` files use
    // destructuring patterns that esbuild can no longer downlevel for
    // safari14 / es2020. Lifting to es2022 + safari16 covers everything
    // the theme emits today without dropping browser support that this
    // docs site actually needs.
    chainWebpack: (config) => {
      const targets = ['es2022', 'edge88', 'firefox78', 'chrome87', 'safari16'];
      ['js', 'ts'].forEach((lang) => {
        if (config.module.rules.has(lang)) {
          const rule = config.module.rule(lang);
          if (rule.uses.has('esbuild-loader')) {
            rule.use('esbuild-loader').tap((opts = {}) => ({
              ...opts,
              target: targets,
            }));
          }
        }
      });
    },
  }),
  base: process.env.DOCS_BASE || '/',
  title: 'Redux Box',
  description: 'Container for redux applications',
  theme: defaultTheme({
    sidebarDepth: 4,
    docsDir: 'docs',
    editLink: true,
    sidebar: {
      '/': [
        {
          text: 'Guide',
          collapsible: false,
          children: [
            { text: 'Introduction', link: '/getting-started.html' },
            { text: 'Core Concepts', link: '/core-concepts.html' },
          ],
        },
        {
          text: 'Examples',
          collapsible: false,
          children: [
            { text: 'A simple counter', link: '/simple-example.html' },
            { text: 'Async data fetching', link: '/advanced-example.html' },
          ],
        },
        {
          text: 'GraphQL integration',
          collapsible: false,
          children: [
            { text: 'Apollo Client', link: '/graphql-apollo.html' },
            { text: 'React Query (TanStack Query)', link: '/graphql-react-query.html' },
          ],
        },
        {
          text: 'Going further',
          collapsible: false,
          children: [
            { text: 'Recipes', link: '/recipes.html' },
            { text: 'Testing', link: '/testing-practises.html' },
          ],
        },
      ],
      ...sidebarTree('Redux Box API'),
    },
    navbar: [
      { text: 'Guide', link: '/getting-started.html' },
      {
        text: 'Examples',
        children: [
          { text: 'A simple counter', link: '/simple-example.html' },
          { text: 'Async data fetching', link: '/advanced-example.html' },
          { text: 'GraphQL: Apollo', link: '/graphql-apollo.html' },
          { text: 'GraphQL: React Query', link: '/graphql-react-query.html' },
        ],
      },
      { text: 'API', link: '/api/' },
      { text: 'GitHub', link: 'https://github.com/anish000kumar/redux-box' },
    ],
  }),
};
