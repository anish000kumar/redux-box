# Async Data Fetching

This example walks through a complete async flow: a React page fetches a list
of posts from an HTTP API, tracks loading and error state, and renders the
result.

It demonstrates:

- A module with **request / success / failure** state.
- A **saga** that performs the HTTP call and dispatches the follow-up actions.
- A clean separation between the API client and the module.
- A component connected via **selectors** and **dispatchers**.

## File structure

```text
src/
  api/
    posts.js
  store/
    posts.js
    index.js
  components/
    PostsPage.js
  App.js
  index.js
```

## API client

Keep network calls **outside** of the module. This keeps sagas trivial to
test (you mock the API client) and makes the module focused on state
transitions.

```js
// src/api/posts.js
export async function fetchPosts() {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts');

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}
```

## The posts module

The state has three flags for the request lifecycle: `isLoading`, `error`,
and the loaded `items`. The component dispatches `posts/FETCH_REQUEST`; the
saga handles the call and dispatches either `posts/FETCH_SUCCESS` or
`posts/FETCH_FAILURE`.

```js
// src/store/posts.js
import { createModule, createSagas } from 'redux-box';
import { call, put } from 'redux-saga/effects';
import { createSelector } from 'reselect';

import * as postsApi from '../api/posts';

const types = {
  FETCH_REQUEST: 'posts/FETCH_REQUEST',
  FETCH_SUCCESS: 'posts/FETCH_SUCCESS',
  FETCH_FAILURE: 'posts/FETCH_FAILURE',
};

const state = {
  items: [],
  isLoading: false,
  error: null,
};

export const dispatchers = {
  fetchPosts: () => ({ type: types.FETCH_REQUEST }),
};

const mutations = {
  [types.FETCH_REQUEST]: state => {
    state.isLoading = true;
    state.error = null;
  },
  [types.FETCH_SUCCESS]: (state, action) => {
    state.isLoading = false;
    state.items = action.posts;
  },
  [types.FETCH_FAILURE]: (state, action) => {
    state.isLoading = false;
    state.error = action.error;
  },
};

function* fetchPostsSaga() {
  try {
    const posts = yield call(postsApi.fetchPosts);
    yield put({ type: types.FETCH_SUCCESS, posts });
  } catch (error) {
    yield put({ type: types.FETCH_FAILURE, error: error.message });
  }
}

const sagas = createSagas({
  [types.FETCH_REQUEST]: fetchPostsSaga,
});

export const getPosts     = state => state.posts.items;
export const getIsLoading = state => state.posts.isLoading;
export const getError     = state => state.posts.error;
export const getPostCount = createSelector(getPosts, posts => posts.length);

export default createModule({ state, dispatchers, mutations, sagas });
```

::: tip Why dispatch the request as a separate action?
Dispatching `FETCH_REQUEST` (rather than calling the API directly inside a
component) gives you three things for free:

1. The reducer flips `isLoading` so your UI can show a spinner.
2. The action shows up in Redux DevTools, making the flow easy to inspect.
3. Tests can assert "the request action was dispatched" without touching the
   network.
:::

## Store setup

Register the module under the same key that your selectors expect.

```js
// src/store/index.js
import { createStore } from 'redux-box';

import posts from './posts';

export default createStore({
  posts,
});
```

## The connected component

`connectStore` attaches selectors and dispatchers as props in one place.

```jsx
// src/components/PostsPage.js
import React, { useEffect } from 'react';
import { connectStore } from 'redux-box';

import {
  dispatchers,
  getError,
  getIsLoading,
  getPosts,
  getPostCount,
} from '../store/posts';

function PostsPage({ posts, postCount, isLoading, error, fetchPosts }) {
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  if (isLoading) return <p>Loading posts…</p>;
  if (error)     return <p role="alert">{error}</p>;

  return (
    <section>
      <h1>{postCount} posts</h1>
      <ul>
        {posts.map(post => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </section>
  );
}

export default connectStore({
  mapSelectors: {
    posts:     getPosts,
    postCount: getPostCount,
    isLoading: getIsLoading,
    error:     getError,
  },
  mapDispatchers: {
    fetchPosts: dispatchers.fetchPosts,
  },
})(PostsPage);
```

## App entry

```jsx
// src/App.js
import React from 'react';
import { Provider } from 'react-redux';

import store from './store';
import PostsPage from './components/PostsPage';

export default function App() {
  return (
    <Provider store={store}>
      <PostsPage />
    </Provider>
  );
}
```

## What just happened

```text
PostsPage mounts
   └─► fetchPosts()
         └─► dispatch { type: 'posts/FETCH_REQUEST' }
               ├─► reducer: isLoading = true, error = null
               └─► saga: yield call(postsApi.fetchPosts)
                     ├─ on success → dispatch FETCH_SUCCESS
                     │                └─► reducer: items = posts, isLoading = false
                     └─ on failure → dispatch FETCH_FAILURE
                                      └─► reducer: error = message, isLoading = false
```

By default `createSagas` uses `takeLatest`, so if the user triggers a refetch
while one is in flight, the older request is automatically cancelled and
only the latest result is committed. To run **every** dispatched request
instead, add the `__@every` suffix:

```js
const sagas = createSagas({
  ['posts/FETCH_REQUEST__@every']: fetchPostsSaga,
});
```

See the [Recipes](/recipes.html) page for more saga patterns, devtools setup,
preloaded state, and integration with custom reducers and middleware.
