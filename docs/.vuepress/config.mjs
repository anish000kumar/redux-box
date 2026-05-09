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
            { text: 'GraphQL: Apollo & React Query', link: '/graphql-integration.html' },
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
