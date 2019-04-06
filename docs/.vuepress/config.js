const { sidebarTree } = require('../api/config');

module.exports = {
  title: 'Redux Box',
  description: 'Just playing around',
  themeConfig: {
    editLinks: true,
    sidebarDepth: 4,
    docsDir: 'code',
    sidebar: Object.assign({}, sidebarTree('Mainpage title')),
    nav: [
      {
        text: 'Home',
        link: '/',
      },
      {
        text: 'API',
        link: '/api/',
      },
    ],
  },
};
