export const redirects = JSON.parse("{}")

export const routes = Object.fromEntries([
  ["/advanced-example.html", { loader: () => import(/* webpackChunkName: "advanced-example.html" */"/Users/akumar52/apps/redux-box/docs/advanced-example.md"), meta: {"title":"Async Data Fetching"} }],
  ["/core-concepts.html", { loader: () => import(/* webpackChunkName: "core-concepts.html" */"/Users/akumar52/apps/redux-box/docs/core-concepts.md"), meta: {"title":"Core Concepts"} }],
  ["/getting-started.html", { loader: () => import(/* webpackChunkName: "getting-started.html" */"/Users/akumar52/apps/redux-box/docs/getting-started.md"), meta: {"title":"Introduction"} }],
  ["/graphql-apollo.html", { loader: () => import(/* webpackChunkName: "graphql-apollo.html" */"/Users/akumar52/apps/redux-box/docs/graphql-apollo.md"), meta: {"title":"Apollo Client"} }],
  ["/graphql-integration.html", { loader: () => import(/* webpackChunkName: "graphql-integration.html" */"/Users/akumar52/apps/redux-box/docs/graphql-integration.md"), meta: {"title":"GraphQL: Apollo & React Query"} }],
  ["/graphql-react-query.html", { loader: () => import(/* webpackChunkName: "graphql-react-query.html" */"/Users/akumar52/apps/redux-box/docs/graphql-react-query.md"), meta: {"title":"React Query (TanStack Query)"} }],
  ["/", { loader: () => import(/* webpackChunkName: "index.html" */"/Users/akumar52/apps/redux-box/docs/readme.md"), meta: {"title":""} }],
  ["/recipes.html", { loader: () => import(/* webpackChunkName: "recipes.html" */"/Users/akumar52/apps/redux-box/docs/recipes.md"), meta: {"title":"Recipes"} }],
  ["/simple-example.html", { loader: () => import(/* webpackChunkName: "simple-example.html" */"/Users/akumar52/apps/redux-box/docs/simple-example.md"), meta: {"title":"A Simple Counter"} }],
  ["/testing-practises.html", { loader: () => import(/* webpackChunkName: "testing-practises.html" */"/Users/akumar52/apps/redux-box/docs/testing-practises.md"), meta: {"title":"Testing"} }],
  ["/api/", { loader: () => import(/* webpackChunkName: "api_index.html" */"/Users/akumar52/apps/redux-box/docs/api/README.md"), meta: {"title":""} }],
  ["/404.html", { loader: () => import(/* webpackChunkName: "404.html" */"/Users/akumar52/apps/redux-box/docs/.vuepress/.temp/pages/404.html.vue"), meta: {"title":""} }],
]);
