# Apollo Client

End-to-end example of combining Redux Box with
[Apollo Client](https://www.apollographql.com/docs/react/) for GraphQL data
fetching.

The architecture follows the same split that's recommended for any modern
data-fetching library:

| Concern                                          | Owner                                       |
| ------------------------------------------------ | ------------------------------------------- |
| Server state (queried data, normalized cache)    | Apollo Client                               |
| Client / UI state (filters, selection, modals)   | Redux Box module                            |
| Cross‑cutting orchestration (mutations + UI)     | Redux Box saga calling the Apollo client    |

::: tip Don't mirror server data into Redux
Apollo already gives you a normalized, deduped, refetchable cache. Copying
every query result into a Redux slice creates two sources of truth and
undoes everything Apollo does for you. Keep server data in Apollo; keep UI
state in Redux Box.
:::

## What we're building

A `posts` feature that:

- Fetches a list of posts with `useQuery`.
- Lets the user filter by a search term, which lives in Redux Box (so it's
  shareable across components and survives re-renders).
- Deletes a post via a saga that calls `apolloClient.mutate(...)`, then
  re-evaluates Apollo's cache and shows a Redux-driven toast.

## File structure

```text
src/
  graphql/
    client.js
    posts.js
  store/
    posts.js
    index.js
  components/
    PostsPage.js
  App.js
  index.js
```

## The Apollo client (singleton)

Exporting the client as a singleton lets sagas import it directly without
needing it to live in saga `context`.

```js
// src/graphql/client.js
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const apolloClient = new ApolloClient({
  link: new HttpLink({ uri: 'https://example.com/graphql' }),
  cache: new InMemoryCache(),
});

export default apolloClient;
```

## GraphQL documents

Keeping the queries and mutations next to the client makes them easy to share
between components and sagas.

```js
// src/graphql/posts.js
import { gql } from '@apollo/client';

export const GET_POSTS = gql`
  query GetPosts($search: String) {
    posts(search: $search) {
      id
      title
      author { id name }
    }
  }
`;

export const DELETE_POST = gql`
  mutation DeletePost($id: ID!) {
    deletePost(id: $id) { id }
  }
`;
```

## The Redux Box module — UI state only

No `items` array — Apollo holds that. The module owns the search term, the
currently selected post, and a transient toast message.

```js
// src/store/posts.js
import { createModule, createSagas } from 'redux-box';
import { call, put } from 'redux-saga/effects';

import apolloClient from '../graphql/client';
import { DELETE_POST, GET_POSTS } from '../graphql/posts';

const types = {
  SET_SEARCH:     'posts/SET_SEARCH',
  SELECT_POST:    'posts/SELECT_POST',
  DELETE_REQUEST: 'posts/DELETE_REQUEST',
  DELETE_SUCCESS: 'posts/DELETE_SUCCESS',
  DELETE_FAILURE: 'posts/DELETE_FAILURE',
  CLEAR_TOAST:    'posts/CLEAR_TOAST',
};

const state = {
  search: '',
  selectedId: null,
  isDeleting: false,
  toast: null, // { kind: 'success' | 'error', message: string }
};

export const dispatchers = {
  setSearch:  search => ({ type: types.SET_SEARCH, search }),
  selectPost: id     => ({ type: types.SELECT_POST, id }),
  deletePost: id     => ({ type: types.DELETE_REQUEST, id }),
  clearToast: ()     => ({ type: types.CLEAR_TOAST }),
};

const mutations = {
  [types.SET_SEARCH]:  (state, { search }) => { state.search = search; },
  [types.SELECT_POST]: (state, { id })     => { state.selectedId = id; },

  [types.DELETE_REQUEST]: state => {
    state.isDeleting = true;
    state.toast = null;
  },
  [types.DELETE_SUCCESS]: state => {
    state.isDeleting = false;
    state.selectedId = null;
    state.toast = { kind: 'success', message: 'Post deleted.' };
  },
  [types.DELETE_FAILURE]: (state, { error }) => {
    state.isDeleting = false;
    state.toast = { kind: 'error', message: error };
  },

  [types.CLEAR_TOAST]: state => { state.toast = null; },
};

function* deletePostSaga({ id }) {
  try {
    // Note the [client, 'mutate'] form: it preserves `this` for Apollo.
    yield call([apolloClient, 'mutate'], {
      mutation: DELETE_POST,
      variables: { id },
      // Tell Apollo to re-run the list query so the UI reflects the deletion.
      refetchQueries: [{ query: GET_POSTS, variables: { search: '' } }],
      awaitRefetchQueries: true,
    });
    yield put({ type: types.DELETE_SUCCESS });
  } catch (error) {
    yield put({ type: types.DELETE_FAILURE, error: error.message });
  }
}

const sagas = createSagas({
  // takeEvery — rapid clicks on different posts must each complete;
  // the default takeLatest would cancel earlier deletions mid-flight.
  [`${types.DELETE_REQUEST}__@every`]: deletePostSaga,
});

export const getSearch     = state => state.posts.search;
export const getSelectedId = state => state.posts.selectedId;
export const getIsDeleting = state => state.posts.isDeleting;
export const getToast      = state => state.posts.toast;

export default createModule({ state, dispatchers, mutations, sagas });
```

::: tip Why call the mutation from a saga?
We could call `useMutation` in the component instead. The saga earns its
keep when the side effect needs to coordinate with **other** Redux state — in
this case, flipping `isDeleting`, clearing `selectedId`, and surfacing a toast
in a single, testable place. As soon as a flow involves more than one piece of
UI state, the saga is the right home.

For richer workflows (optimistic updates, undo windows, multi-step
coordination) see the [React Query example](/graphql-react-query.html), which
walks through an undo-enabled delete.
:::

## Store setup

Standard Redux Box setup — Apollo lives outside the store entirely.

```js
// src/store/index.js
import { createStore } from 'redux-box';
import posts from './posts';

export default createStore({ posts });
```

## The connected component

Hooks (`useQuery`, `useMutation`) and `connectStore` compose cleanly: the
component is connected to Redux Box for UI state and reads server data via
Apollo's hook.

```jsx
// src/components/PostsPage.js
import React from 'react';
import { useQuery } from '@apollo/client';
import { connectStore } from 'redux-box';

import { GET_POSTS } from '../graphql/posts';
import {
  dispatchers,
  getIsDeleting,
  getSearch,
  getSelectedId,
  getToast,
} from '../store/posts';

function PostsPage({
  search,
  selectedId,
  isDeleting,
  toast,
  setSearch,
  selectPost,
  deletePost,
  clearToast,
}) {
  const { data, loading, error } = useQuery(GET_POSTS, {
    variables: { search },
    fetchPolicy: 'cache-and-network',
  });

  return (
    <section>
      <input
        value={search}
        placeholder="Search posts…"
        onChange={e => setSearch(e.target.value)}
      />

      {loading && <p>Loading…</p>}
      {error   && <p role="alert">{error.message}</p>}

      <ul>
        {data?.posts.map(post => (
          <li
            key={post.id}
            aria-selected={post.id === selectedId}
            onClick={() => selectPost(post.id)}
          >
            <strong>{post.title}</strong> — {post.author.name}
            <button
              disabled={isDeleting}
              onClick={e => {
                e.stopPropagation();
                deletePost(post.id);
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      {toast && (
        <div role="status" data-kind={toast.kind} onClick={clearToast}>
          {toast.message}
        </div>
      )}
    </section>
  );
}

export default connectStore({
  mapSelectors: {
    search:     getSearch,
    selectedId: getSelectedId,
    isDeleting: getIsDeleting,
    toast:      getToast,
  },
  mapDispatchers: {
    setSearch:  dispatchers.setSearch,
    selectPost: dispatchers.selectPost,
    deletePost: dispatchers.deletePost,
    clearToast: dispatchers.clearToast,
  },
})(PostsPage);
```

## App entry

Apollo's provider and Redux's provider both wrap the tree.

```jsx
// src/App.js
import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { Provider } from 'react-redux';

import apolloClient from './graphql/client';
import store from './store';
import PostsPage from './components/PostsPage';

export default function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <Provider store={store}>
        <PostsPage />
      </Provider>
    </ApolloProvider>
  );
}
```

## What just happened

```text
User types in <input>
   └─► setSearch('hello')
         └─► reducer: state.posts.search = 'hello'
               └─► PostsPage re-renders with new `search` prop
                     └─► useQuery(GET_POSTS, { variables: { search } })
                           refetches and Apollo updates `data`

User clicks "Delete"
   └─► deletePost(id)
         └─► dispatch { type: 'posts/DELETE_REQUEST', id }
               ├─► reducer: isDeleting = true, toast = null
               └─► saga: yield call([apolloClient, 'mutate'], …)
                     ├─ on success → DELETE_SUCCESS
                     │                └─► reducer: isDeleting = false,
                     │                              toast = { kind: 'success', … }
                     │                └─► Apollo refetches GET_POSTS,
                     │                    list re-renders without the post.
                     └─ on failure → DELETE_FAILURE
                                       └─► reducer: error toast
```

## Testing the saga

The manual-stepping pattern from [Testing](/testing-practises.html) works
unchanged. Because the saga uses `call([client, 'method'], …)`, your effect
assertions stay free of network code:

```js
import { call, put } from 'redux-saga/effects';

import apolloClient from '../src/graphql/client';
import { DELETE_POST, GET_POSTS } from '../src/graphql/posts';

function* deletePostSaga({ id }) { /* …as above… */ }

test('deletePostSaga dispatches SUCCESS on a 200', () => {
  const gen = deletePostSaga({ id: 'p1' });

  expect(gen.next().value).toEqual(
    call([apolloClient, 'mutate'], {
      mutation: DELETE_POST,
      variables: { id: 'p1' },
      refetchQueries: [{ query: GET_POSTS, variables: { search: '' } }],
      awaitRefetchQueries: true,
    }),
  );

  expect(gen.next({ data: { deletePost: { id: 'p1' } } }).value).toEqual(
    put({ type: 'posts/DELETE_SUCCESS' }),
  );

  expect(gen.next().done).toBe(true);
});
```

No Apollo server, no React Query provider — just the generator and a couple
of asserts.

## Apollo or React Query?

| Question                                             | Pick Apollo if… | Pick React Query if… |
| ---------------------------------------------------- | --------------- | -------------------- |
| Is your backend GraphQL‑only?                        | yes             | doesn't matter       |
| Do you want a normalized cache out of the box?       | yes             | no                   |
| Are you also calling REST endpoints?                 | mixed setup     | one tool fits all    |
| Do you want the smallest bundle footprint?           | no              | yes                  |
| Do you need built‑in subscriptions / link transport? | yes             | not directly         |

The Redux Box layer is **identical** in both examples — that's the point. The
module knows nothing about HTTP or GraphQL; the saga reaches out through a
thin singleton. Swapping Apollo for React Query (or REST, or gRPC‑Web) is a
local change to the saga and the component, never to the module's contract.

If React Query is the better fit for you, head over to the
[React Query example](/graphql-react-query.html), which also walks through
an optimistic delete with a 5‑second undo window — a workflow that goes
beyond what `useMutation` alone can express.
