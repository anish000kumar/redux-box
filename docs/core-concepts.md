# Core Concepts

A Redux Box application is a collection of **modules**. Each module is a
self-contained slice of your store: its initial state, the mutations that
update it, the action creators that trigger those mutations, the side effects
(sagas), and the derived selectors.

This page walks through each segment in detail.

## The anatomy of a module

```js
import { createModule, createSagas } from 'redux-box';
import { call, put } from 'redux-saga/effects';

const state = {
  /* initial slice */
};

export const dispatchers = {
  /* action creators */
};

const mutations = {
  /* action.type → (state, action) => void */
};

const sagas = createSagas({
  /* action.type → generator function */
});

export const selectors = {
  /* derived state */
};

export default createModule({
  state,
  dispatchers,
  mutations,
  sagas,
  selectors,
});
```

You can omit any segment you don't need. A module with only `state` and
`mutations` is perfectly valid.

## State

Just a plain object. It becomes the initial value of this module's slice
inside `combineReducers`:

```js
const state = {
  items: [],
  isLoading: false,
  error: null,
};
```

When a module is registered as `createStore({ posts: postsModule })`, it lives
at `state.posts` and starts with the value above.

## Mutations

Mutations are reducers — but written as if you were mutating state directly.
Redux Box runs each one through [Immer](https://github.com/immerjs/immer)'s
`produce`, so the underlying store stays immutable.

```js
const mutations = {
  'posts/ADD': (state, action) => {
    state.items.push(action.post);
  },
  'posts/CLEAR': state => {
    state.items = [];
  },
};
```

A few things to keep in mind:

- The first argument is **a draft**, not the real state. You can freely
  assign, push, splice, delete keys, etc.
- If you don't change anything, the original object reference is preserved
  (great for `===` equality checks).
- You can also **return a new object** instead of mutating; Immer handles both
  styles. Just don't do both in the same mutation.
- Async work does **not** belong here. Use sagas for that.

::: tip Action types are strings of your choosing
There's no `createTypes()` helper. Use whatever string convention you like —
`'posts/ADD'`, `'ADD_POST'`, `Symbol.for('posts/add')`. The same string is
the key in `mutations` and the `type` returned by your dispatcher.
:::

## Dispatchers

`dispatchers` is the module's collection of action creators. Each function
returns a plain action object. They're the public, callable surface of the
module — components import them (or the whole `dispatchers` object) to trigger
behavior.

```js
export const dispatchers = {
  addPost: post => ({ type: 'posts/ADD', post }),
  clear: () => ({ type: 'posts/CLEAR' }),
};
```

When passed to `connectStore` via `mapDispatchers`, react-redux automatically
wraps them in `dispatch()`:

```js
connectStore({
  mapDispatchers: { addPost: dispatchers.addPost },
})(MyComponent);
```

Inside `MyComponent`, `this.props.addPost(post)` will dispatch the action.

## Sagas

Sagas are how you handle side effects — API calls, timers, navigation, anything
asynchronous. Redux Box uses [redux-saga](https://redux-saga.js.org/) under the
hood; if you've written a saga before, this will look familiar.

`createSagas` converts a `{ actionType: workerSaga }` map into an array of
**watcher** sagas, which `createStore` then runs as part of the root saga.

```js
import { createSagas } from 'redux-box';
import { call, put } from 'redux-saga/effects';

const sagas = createSagas({
  'posts/FETCH_REQUEST': function* () {
    try {
      const posts = yield call(api.fetchPosts);
      yield put({ type: 'posts/FETCH_SUCCESS', posts });
    } catch (error) {
      yield put({ type: 'posts/FETCH_FAILURE', error: error.message });
    }
  },
});
```

By default each watcher uses `takeLatest`. To switch a single saga to
`takeEvery`, append the `__@every` suffix to the action key:

```js
const sagas = createSagas({
  // takeLatest (default) — only the most recent run survives.
  'posts/FETCH_REQUEST': fetchPosts,

  // takeEvery — every dispatched action spawns its own run.
  'analytics/TRACK__@every': trackEvent,
});
```

::: tip When to use which
- `takeLatest`: idempotent reads (search, fetch, refresh) where you only
  care about the most recent result.
- `takeEvery`: writes / events you don't want to drop (analytics, optimistic
  posts, queueing).
:::

If you need full control (debounce, throttle, custom watcher), declare the
watcher saga manually and add it via the `sagas` config of `createStore` —
see the [Recipes](/recipes.html#custom-watcher-sagas) page.

## Selectors

Selectors are functions that read from the store. Co-locating them with the
module keeps consumers from having to know the module's exact key in state.

```js
import { createSelector } from 'reselect';

export const getItems = state => state.posts.items;
export const getCount = state => state.posts.items.length;

export const getPublishedItems = createSelector(getItems, items =>
  items.filter(p => p.published),
);
```

Pass them to a component via `mapSelectors`:

```js
connectStore({
  mapSelectors: {
    posts: getItems,
    publishedPosts: getPublishedItems,
    postCount: getCount,
  },
})(PostsList);
```

::: tip Decoupling selectors from the slice key
If you'd rather not hard-code `state.posts.items`, the module exposes
`module.getSelector()` which returns a selector for its own slice:

```js
import postsModule from './posts';

const getPostsSlice = postsModule.getSelector();
export const getItems = state => getPostsSlice(state).items;
```

This means renaming the slice in `createStore({ ... })` won't break selectors.
:::

## Connecting to React

`connectStore` is a thin wrapper around react-redux's `connect`. It accepts:

```js
connectStore({
  mapState,        // (state, ownProps) => stateProps
  mapSelectors,    // { propName: selector }
  mapDispatchers,  // { propName: actionCreator } — auto-wrapped in dispatch
  mergeProps,      // (stateProps, dispatchProps, ownProps) => finalProps
  options,         // forwarded to react-redux's connect
})(Component);
```

Use it as a function or as a decorator (if your toolchain supports it):

```js
// Function form (works everywhere)
export default connectStore({ /* ... */ })(MyComponent);

// Decorator form (requires @babel/plugin-proposal-decorators)
@connectStore({ /* ... */ })
class MyComponent extends React.Component { /* ... */ }
```

::: warning About decorators
Decorators are still a stage-2 proposal. To use the `@connectStore` syntax
you'll need a Babel config that includes
`['@babel/plugin-proposal-decorators', { legacy: true }]`. The function form
has no such requirement and is recommended for most projects.
:::

## Putting it all together

```js
// src/store/posts.js
import { createModule, createSagas } from 'redux-box';
import { call, put } from 'redux-saga/effects';
import { createSelector } from 'reselect';
import * as api from '../api/posts';

const state = {
  items: [],
  isLoading: false,
  error: null,
};

export const dispatchers = {
  fetchPosts: () => ({ type: 'posts/FETCH_REQUEST' }),
  clear:      () => ({ type: 'posts/CLEAR' }),
};

const mutations = {
  'posts/FETCH_REQUEST': state => {
    state.isLoading = true;
    state.error = null;
  },
  'posts/FETCH_SUCCESS': (state, action) => {
    state.isLoading = false;
    state.items = action.posts;
  },
  'posts/FETCH_FAILURE': (state, action) => {
    state.isLoading = false;
    state.error = action.error;
  },
  'posts/CLEAR': state => {
    state.items = [];
  },
};

const sagas = createSagas({
  'posts/FETCH_REQUEST': function* () {
    try {
      const posts = yield call(api.fetchPosts);
      yield put({ type: 'posts/FETCH_SUCCESS', posts });
    } catch (error) {
      yield put({ type: 'posts/FETCH_FAILURE', error: error.message });
    }
  },
});

export const getItems = state => state.posts.items;
export const getIsLoading = state => state.posts.isLoading;
export const getError = state => state.posts.error;
export const getItemCount = createSelector(getItems, items => items.length);

export default createModule({ state, dispatchers, mutations, sagas });
```

That's a complete feature — state, behavior, side effects, and reads — in a
single ~40-line file.

Continue with the [Simple Example](/simple-example.html) for a runnable counter
app, or jump to [Recipes](/recipes.html) for common patterns.
