const { sidebarTree } = require('../api/config');

module.exports = {
  title: 'Redux Box',
  description: 'Container for redux applications',
  themeConfig: {
    editLinks: true,
    sidebarDepth: 4,
    docsDir: 'code',
    sidebar: {
      '/': [
        ['/why', 'Why Redux Box?'],
        ['/getting-started', 'Getting Started'],
        ['/simple-example', 'Creating a simple app'],
        ['/advanced-example', 'Advanced example app'],
        ['/recipes', 'Recipes'],
        ['/testing-practises', 'Testing'],
      ],
    },
    nav: [
      {
        text: 'Home',
        link: '/',
      },
      {
        text: 'Guide',
        link: '/why.html',
      },
      {
        text: 'API',
        link: '/api/',
      },
    ],
  },
};
