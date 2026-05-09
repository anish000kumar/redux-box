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

For **parameterized** reads, the mirror helper is `module.lazySelect(cb)`.
The callback receives the slice plus any extra arguments, and the returned
selector has the `(state, ...args) => result` shape expected by
`mapLazySelectors`:

```js
export const getItemById = module.lazySelect(
  (slice, id) => slice.items.find(item => item.id === id),
);
```

Like `select`, `lazySelect` is **slice-keyed memoized**: the cache key is
`(slice, ...args)`, not `(state, ...args)`. Calling the selector with the
same slice reference and the same args returns the previously computed
result by reference, including across dispatches that don't touch this
module's slice. Varying any argument produces a fresh computation, with the
prior cache entries still retained. See the
[Parameterized (lazy) selectors](#parameterized-lazy-selectors) recipe below
for the memory-shape caveat (primitive args grow an unbounded `Map` and
should be bounded if you call across thousands of distinct values).

Renaming the slice (`createStore({ posts: ... })` → `createStore({ feed: ... })`)
won't break selectors written either way.

## Parameterized (lazy) selectors

Eager selectors (`mapSelectors`) are evaluated once per render with `(state,
ownProps)`. That works great for "give me the visible posts" but fits awkwardly
when the read needs an argument the component decides at call time — e.g.
"give me the user with id `X`" inside a click handler, or "format `amount`
in `currency`".

`mapLazySelectors` lets you write the selector naturally, with extra
arguments, and exposes it to the component as a callable:

```js
// store/users/selectors.js
export const selectAllUsers = state => state.users.items;
export const selectUserById = (state, id) =>
  state.users.items.find(u => u.id === id);
export const selectUsersByRole = (state, role) =>
  state.users.items.filter(u => u.role === role);
```

::: tip Prefer `module.lazySelect(cb)` for slice-decoupled lazy selectors
The same selectors written with the module helper:

```js
// store/users/selectors.js
import usersModule from './index';

export const selectAllUsers = usersModule.select(slice => slice.items);
export const selectUserById = usersModule.lazySelect(
  (slice, id) => slice.items.find(u => u.id === id),
);
export const selectUsersByRole = usersModule.lazySelect(
  (slice, role) => slice.items.filter(u => u.role === role),
);
```

`module.select` / `module.lazySelect` close over `module.getSelector()`, so
your selectors stay decoupled from the slice key chosen in
`createStore({ users: ... })`.
:::

```jsx
// UserDirectory.jsx
import { connectStore } from 'redux-box';
import {
  selectAllUsers,
  selectUserById,
  selectUsersByRole,
} from './store/users/selectors';

function UserDirectory({ users, getUserById, getUsersByRole }) {
  return (
    <div>
      <h2>All users ({users.length})</h2>
      {users.map(u => (
        <UserRow key={u.id} user={u} />
      ))}

      <h2>Admins</h2>
      {getUsersByRole('admin').map(u => (
        <UserRow key={u.id} user={u} />
      ))}

      <button onClick={() => console.log(getUserById(42))}>
        Log user 42
      </button>
    </div>
  );
}

export default connectStore({
  mapSelectors:     { users: selectAllUsers },
  mapLazySelectors: {
    getUserById:    selectUserById,
    getUsersByRole: selectUsersByRole,
  },
})(UserDirectory);
```

How it works:

- Each `mapLazySelectors` entry is wrapped into `(...args) => value`. The
  wrapper closes over a ref to the latest store state, so calling it always
  returns fresh data — even from inside an event handler.
- The wrapper's function reference is **stable across renders**. Passing it
  to `React.memo` children or listing it in a `useEffect`/`useCallback`
  dependency array won't cause unnecessary work.

### Stable references mean: lazy selectors don't trigger re-renders by themselves

Because the wrapper reference never changes, a component connected only via
`mapLazySelectors` will **not** re-render when state updates — there's
nothing in `mapStateToProps` whose value changed.

If you need the component to re-render when the underlying data changes,
also subscribe to that data via `mapState` or an eager `mapSelectors` entry.
The example above does both: `users` (eager) drives re-renders, and
`getUserById` / `getUsersByRole` (lazy) are convenience callables on top of
the latest state.

A useful mental model: lazy selectors are like `useStore().getState()` — a
fresh read at the call site, independent of subscription. Eager selectors
are like `useSelector()` — a subscription that drives re-renders.

### Memoization (when you use `module.lazySelect`)

Selectors built with `module.lazySelect(cb)` are memoized via reselect 5's
`weakMapMemoize`, keyed on the **`(slice, ...args)` tuple** — *not* on the
root `state`. Concretely:

- Calling the selector with the **same slice reference and same args**
  returns the same result by reference — including the same array/object
  reference if `cb` produces one. Useful when the result feeds into
  `useMemo` / `useEffect` dependencies or another selector chain.
- Unrelated dispatches (anything that doesn't touch this module's slice)
  leave the cache intact: the root `state` ref changes, but
  `module.getSelector()` returns the same slice ref, so the cache key is
  unchanged and the call is a hit. This matches what `module.select`
  already does for non-parameterized reads.
- Varying any argument produces a fresh computation. Prior cache entries
  are retained, so repeatedly alternating `getUserById(state, 1)` /
  `getUserById(state, 2)` hits the cache for both after the first miss.
- A dispatch that *does* touch the slice produces a new slice ref, which
  recomputes; the old slice's cache entries become unreachable and
  GC-eligible (slice is held weakly).

Plain `(state, ...args) => result` functions passed to `mapLazySelectors`
**are not memoized** — only the wrapper around them is reference-stable.
Use `module.lazySelect` (or hand-roll with `weakMapMemoize` /
`createSelector` / `re-reselect`) when you need result-level memoization.

::: warning Memory shape: primitive arg axes
`weakMapMemoize` keys object arguments through a `WeakMap` (GC-friendly) but
keys primitive arguments — numbers, strings — through a regular `Map` that
grows for the lifetime of the selector.

If you call `getUserById(state, id)` across an unbounded set of `id`s — e.g.
an admin tool that paginates through 50,000 users — that's 50,000 retained
`Map` entries. For those cases, pass a bounded memoizer to `lazySelect`:

```js
import { lruMemoize } from 'reselect';

export const getUserById = usersModule.lazySelect(
  (slice, id) => slice.byId[id],
  { memoize: lruMemoize },
);
```

`lruMemoize` defaults to `maxSize: 1`, so for a non-trivial cache you'll
typically want to wrap it (or use a custom factory) to set the size you
need. Or reach for [`re-reselect`](https://github.com/toomuchdesign/re-reselect)
for an explicit keyed cache. The same caveat applies to any selector you
hand-roll — `module.lazySelect` doesn't introduce it, just makes it
visible.
:::

### When to reach for which

| You want…                                                  | Use                       |
| ---------------------------------------------------------- | ------------------------- |
| A value the component renders                              | `mapSelectors`            |
| A value derived from `ownProps` you can compute up front   | `mapSelectors` (it gets `ownProps`) |
| A read with arguments the component decides at call time   | `mapLazySelectors`        |
| A read inside an event handler / effect, not in JSX        | `mapLazySelectors`        |
| Stable function refs for `React.memo` / `useEffect` deps   | `mapLazySelectors`        |

::: tip Avoid the `(state) => () => ...` pattern
A common workaround for parameterized reads is to define the selector as
`selectUsers: state => () => realSelectUsers(state)`. It works, but every
dispatch causes `mapStateToProps` to run, which produces a *new* function
reference, which makes react-redux re-render the component on every action —
even ones unrelated to that data.

`mapLazySelectors` keeps the same ergonomics and gives you a stable
reference, so you don't pay that cost.
:::

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
