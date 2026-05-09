# Advanced example: async API requests

This example shows a larger module that fetches posts from an API with
`redux-saga`, stores the result in a Redux Box module, exposes selectors, and
connects the module to a React component.

## File structure

```text
src/
  api/
    posts.js
  store/
    index.js
    posts.js
  components/
    PostsPage.js
  App.js
```

## API client

Keep network calls outside of the module. This makes sagas easier to test and
keeps the module focused on state transitions.

```javascript
// src/api/posts.js
export async function fetchPosts() {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts');

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}
```

## Posts module

The module has three states for the request: loading, success, and failure. The
component dispatches `FETCH_POSTS_REQUEST`; the saga performs the request and
then dispatches either `FETCH_POSTS_SUCCESS` or `FETCH_POSTS_FAILURE`.

```javascript
// src/store/posts.js
import { createModule, createSagas } from 'redux-box';
import { call, put } from 'redux-saga/effects';
import * as postsApi from '../api/posts';

const types = {
  FETCH_POSTS_REQUEST: 'posts/FETCH_POSTS_REQUEST',
  FETCH_POSTS_SUCCESS: 'posts/FETCH_POSTS_SUCCESS',
  FETCH_POSTS_FAILURE: 'posts/FETCH_POSTS_FAILURE',
};

const state = {
  items: [],
  isLoading: false,
  error: null,
};

export const dispatchers = {
  fetchPosts: () => ({ type: types.FETCH_POSTS_REQUEST }),
};

const mutations = {
  [types.FETCH_POSTS_REQUEST]: state => {
    state.isLoading = true;
    state.error = null;
  },
  [types.FETCH_POSTS_SUCCESS]: (state, action) => {
    state.isLoading = false;
    state.items = action.posts;
  },
  [types.FETCH_POSTS_FAILURE]: (state, action) => {
    state.isLoading = false;
    state.error = action.error;
  },
};

function* fetchPosts() {
  try {
    const posts = yield call(postsApi.fetchPosts);
    yield put({
      type: types.FETCH_POSTS_SUCCESS,
      posts,
    });
  } catch (error) {
    yield put({
      type: types.FETCH_POSTS_FAILURE,
      error: error.message,
    });
  }
}

const sagas = createSagas({
  [types.FETCH_POSTS_REQUEST]: fetchPosts,
});

export const getPosts = state => state.posts.items;
export const getIsLoading = state => state.posts.isLoading;
export const getError = state => state.posts.error;

export default createModule({
  state,
  mutations,
  sagas,
});
```

## Store setup

Register the module under the same key that your selectors use.

```javascript
// src/store/index.js
import { createStore } from 'redux-box';
import posts from './posts';

export default createStore({
  posts,
});
```

## Connected component

`connectStore` can attach regular state, selectors, and dispatchers to the
component in one place.

```javascript
// src/components/PostsPage.js
import React from 'react';
import { connectStore } from 'redux-box';
import {
  dispatchers,
  getError,
  getIsLoading,
  getPosts,
} from '../store/posts';

class PostsPage extends React.Component {
  componentDidMount() {
    this.props.fetchPosts();
  }

  render() {
    const { error, isLoading, posts } = this.props;

    if (isLoading) {
      return <p>Loading posts...</p>;
    }

    if (error) {
      return <p role="alert">{error}</p>;
    }

    return (
      <ul>
        {posts.map(post => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    );
  }
}

export default connectStore({
  mapSelectors: {
    posts: getPosts,
    isLoading: getIsLoading,
    error: getError,
  },
  mapDispatchers: {
    fetchPosts: dispatchers.fetchPosts,
  },
})(PostsPage);
```

## App entry

Wrap the application in the Redux provider as usual.

```javascript
// src/App.js
import React from 'react';
import { Provider } from 'react-redux';
import PostsPage from './components/PostsPage';
import store from './store';

export default function App() {
  return (
    <Provider store={store}>
      <PostsPage />
    </Provider>
  );
}
```

## Flow

1. `PostsPage` mounts and calls `fetchPosts`.
2. `FETCH_POSTS_REQUEST` sets `isLoading` to `true`.
3. The saga calls the API client.
4. A successful response dispatches `FETCH_POSTS_SUCCESS` and stores the posts.
5. A failed response dispatches `FETCH_POSTS_FAILURE` and stores the error
   message.
