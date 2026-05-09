export const redirects = JSON.parse("{}")

export const routes = Object.fromEntries([
  ["/advanced-example.html", { loader: () => import(/* webpackChunkName: "advanced-example.html" */"/Users/akumar52/apps/redux-box/docs/advanced-example.md"), meta: {"title":""} }],
  ["/getting-started.html", { loader: () => import(/* webpackChunkName: "getting-started.html" */"/Users/akumar52/apps/redux-box/docs/getting-started.md"), meta: {"title":""} }],
  ["/", { loader: () => import(/* webpackChunkName: "index.html" */"/Users/akumar52/apps/redux-box/docs/readme.md"), meta: {"title":""} }],
  ["/readme1.html", { loader: () => import(/* webpackChunkName: "readme1.html" */"/Users/akumar52/apps/redux-box/docs/readme1.md"), meta: {"title":"Redux Box"} }],
  ["/recipes.html", { loader: () => import(/* webpackChunkName: "recipes.html" */"/Users/akumar52/apps/redux-box/docs/recipes.md"), meta: {"title":""} }],
  ["/simple-example.html", { loader: () => import(/* webpackChunkName: "simple-example.html" */"/Users/akumar52/apps/redux-box/docs/simple-example.md"), meta: {"title":""} }],
  ["/testing-practises.html", { loader: () => import(/* webpackChunkName: "testing-practises.html" */"/Users/akumar52/apps/redux-box/docs/testing-practises.md"), meta: {"title":""} }],
  ["/api/", { loader: () => import(/* webpackChunkName: "api_index.html" */"/Users/akumar52/apps/redux-box/docs/api/README.md"), meta: {"title":""} }],
  ["/api/connectStore.html", { loader: () => import(/* webpackChunkName: "api_connectStore.html" */"/Users/akumar52/apps/redux-box/docs/api/connectStore.md"), meta: {"title":"connectStore"} }],
  ["/api/createModule.html", { loader: () => import(/* webpackChunkName: "api_createModule.html" */"/Users/akumar52/apps/redux-box/docs/api/createModule.md"), meta: {"title":"createModule"} }],
  ["/api/createSagas.html", { loader: () => import(/* webpackChunkName: "api_createSagas.html" */"/Users/akumar52/apps/redux-box/docs/api/createSagas.md"), meta: {"title":"createSagas"} }],
  ["/api/createStore.html", { loader: () => import(/* webpackChunkName: "api_createStore.html" */"/Users/akumar52/apps/redux-box/docs/api/createStore.md"), meta: {"title":"createStore"} }],
  ["/api/moduleRegistry.html", { loader: () => import(/* webpackChunkName: "api_moduleRegistry.html" */"/Users/akumar52/apps/redux-box/docs/api/moduleRegistry.md"), meta: {"title":"moduleRegistry"} }],
  ["/api/src-index.html", { loader: () => import(/* webpackChunkName: "api_src-index.html" */"/Users/akumar52/apps/redux-box/docs/api/src-index.md"), meta: {"title":"src-index"} }],
  ["/api/utils/get.html", { loader: () => import(/* webpackChunkName: "api_utils_get.html" */"/Users/akumar52/apps/redux-box/docs/api/utils/get.md"), meta: {"title":"get"} }],
  ["/404.html", { loader: () => import(/* webpackChunkName: "404.html" */"/Users/akumar52/apps/redux-box/docs/.vuepress/.temp/pages/404.html.vue"), meta: {"title":""} }],
]);
