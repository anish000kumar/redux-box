# Recipes

Practical patterns for real-world Redux Box apps. Each recipe is independent —
read what you need, skip the rest.

[[toc]]

## Configuring the store

`createStore(modules, config)` accepts an optional second argument with these
keys:

```js
createStore(
  { user, posts, ui },
  {
    middlewares:    [logger],          // extra redux middleware
    sagas:          [extraWatcherSaga],// watcher sagas not tied to a module
    reducers:       { router: routerReducer }, // extra slice reducers
    preloadedState: window.__INITIAL_STATE__,
    decorateReducer: rootReducer => persistReducer(persistConfig, rootReducer),
    composeRedux:    compose => composeWithDevToolsCustom(compose),
    enableDevTools:  () => process.env.NODE_ENV !== 'production',
    devToolOptions:  { trace: true, traceLimit: 25 },
  },
);
```

Every key is optional — pass only what you actually need.

## Enabling Redux DevTools

By default, devtools are auto-enabled when `process.env.NODE_ENV !== 'production'`.
If you want to take manual control:

```js
createStore(modules, {
  enableDevTools: () => process.env.NODE_ENV === 'development',
  devToolOptions: { trace: true, traceLimit: 25 },
});
```

## Adding extra middleware

For example, logging or analytics:

```js
import { createLogger } from 'redux-logger';
import { createStore } from 'redux-box';

import modules from './modules';

const logger = createLogger({ collapsed: true });

export default createStore(modules, {
  middlewares: [logger],
});
```

The saga middleware is added by Redux Box itself — you don't need to register
it.

## Preloaded state (SSR / rehydration)

```js
const preloadedState = window.__INITIAL_STATE__;

const store = createStore(modules, { preloadedState });
```

For server-side rendering, dispatch your fetch actions on the server, then
serialize `store.getState()` into `window.__INITIAL_STATE__` in the HTML
response.

## Mixing in non-Redux-Box reducers

If you have third-party reducers (e.g. `connected-react-router`,
`redux-form`, …) that don't fit the module shape, register them via the
`reducers` config:

```js
import { connectRouter } from 'connected-react-router';
import { reducer as formReducer } from 'redux-form';

createStore(
  { user, posts },
  {
    reducers: {
      router: connectRouter(history),
      form:   formReducer,
    },
  },
);
```

These are merged with the module reducers via `combineReducers`.

## Custom watcher sagas

`createSagas` is a convenience for the common
`takeLatest` / `takeEvery` patterns. If you need debounce, throttle,
`takeLeading`, or a fully custom watcher, write the saga by hand and pass it
to `createStore` via `config.sagas`:

```js
import { debounce, call } from 'redux-saga/effects';
import * as searchApi from './api/search';

function* watchSearch() {
  yield debounce(300, 'search/QUERY_CHANGED', function* (action) {
    yield call(searchApi.search, action.query);
  });
}

createStore(modules, {
  sagas: [watchSearch()],
});
```

## `takeEvery` vs `takeLatest`

`createSagas` uses `takeLatest` by default. Append `__@every` to switch:

```js
const sagas = createSagas({
  // takeLatest — only the most recent run survives.
  'posts/FETCH_REQUEST': fetchPosts,

  // takeEvery — every dispatched action spawns its own run.
  'analytics/TRACK__@every': trackEvent,
});
```

| Use case                           | Pattern      |
| ---------------------------------- | ------------ |
| Search-as-you-type, refresh, fetch | `takeLatest` |
| Analytics events, optimistic posts | `takeEvery`  |
| Form submits (avoid double-submit) | `takeLeading` (custom watcher) |
| Debounced inputs                   | `debounce` (custom watcher) |

## Persisting state with redux-persist

Use `decorateReducer` to wrap the combined reducer with `persistReducer`:

```js
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import { createStore } from 'redux-box';
import modules from './modules';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user'], // only persist the user module
};

export const store = createStore(modules, {
  decorateReducer: rootReducer => persistReducer(persistConfig, rootReducer),
});

export const persistor = persistStore(store);
```

Then wrap your app in `<PersistGate>` as usual.

## Decoupling selectors from the slice key

Hard-coding `state.posts.items` couples every selector to the name you
chose in `createStore({ posts: postsModule })`. The module exposes a helper
to keep things decoupled:

```js
// src/store/posts.js
import { createModule } from 'redux-box';

const module = createModule({ state: { items: [] }, mutations: {} });

const getSlice = module.getSelector(); // (state) => state.<moduleName>

export const getItems = state => getSlice(state).items;

export default module;
```

Or use `module.select(cb)` to build a memoized [reselect](https://github.com/reduxjs/reselect)
selector against the slice:

```js
export const getItemCount = module.select(slice => slice.items.length);
```

Renaming the slice (`createStore({ posts: ... })` → `createStore({ feed: ... })`)
won't break selectors written this way.

## Using a module's reducer directly

Need to register a Redux Box module inside a vanilla `redux.createStore`?
The mutations + initial state can be turned into a regular reducer with the
internal `getReducer` helper, but the simpler path is to drop your
`createStore` of choice and let Redux Box wire things up.

If you really need to plug just the reducer into a foreign tree:

```js
import { combineReducers, createStore as reduxCreateStore } from 'redux';
import postsModule from './store/posts';

// Build a reducer from a module's mutations + initial state.
function moduleToReducer(module) {
  const { state: initial, mutations = {} } = module;
  return require('redux-box/dist/getReducer').default(mutations, initial);
}

const root = combineReducers({
  posts: moduleToReducer(postsModule),
});

const store = reduxCreateStore(root);
```

You'll have to register the sagas yourself in this case. For most apps,
prefer Redux Box's `createStore`.

## Migrating from v1.x

A few APIs changed in v2:

| v1                                  | v2                                            |
| ----------------------------------- | --------------------------------------------- |
| `createStore([userModule, ...])`    | `createStore({ user: userModule, ... })`      |
| `actions: { ... }`                  | `dispatchers: { ... }`                        |
| `createContainer` / render props    | Use `connectStore` (function or decorator)    |
| `createActions` / `using()` helpers | Removed. Write action creators by hand.       |
| `module.name` field                 | The slice key in `createStore({ key: mod })` is the name. |

The state shape and Immer-powered mutations are unchanged.
