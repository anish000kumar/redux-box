# React Query (TanStack Query)

End-to-end example of combining Redux Box with
[`@tanstack/react-query`](https://tanstack.com/query) for server state and
[`graphql-request`](https://github.com/jasonkuhrt/graphql-request) as the
GraphQL transport.

The architecture follows the same split that's recommended for any modern
data-fetching library:

| Concern                                          | Owner                                              |
| ------------------------------------------------ | -------------------------------------------------- |
| Server state (queried data, normalized cache)    | React Query (`useQuery` / `QueryClient`)           |
| Per-component UI state                           | `useState` — keep it local until it needs to be shared |
| Cross-cutting client state, multi-step workflows | Redux Box module + saga                            |

::: tip Don't mirror server data into Redux
React Query already gives you a deduped, cacheable, refetchable store of
server data. Copying every query result into a Redux slice creates two
sources of truth and undoes everything React Query does for you. Keep server
data in the query cache; reach for Redux Box only for the workflow bits.
:::

## What we're building

For a one-shot mutation with a spinner and a toast,
[`useMutation`](https://tanstack.com/query/latest/docs/framework/react/guides/mutations)
is the right tool — you don't need anything else. (See the
[Apollo example](/graphql-apollo.html) for that shape of feature.)

So this example builds something `useMutation` genuinely doesn't model well:
an **optimistic delete with a 5‑second undo window**, with multiple
deletions allowed to be pending at once. Think Gmail's "Undo send" or VS
Code's "Undo close tab".

::: tip When Redux Box earns its place alongside TanStack Query
The undo flow needs three things at the same time:

1. **A timer race per pending operation** — the API call only fires if 5s
   elapse without an undo. `redux-saga`'s `race(delay, take)` does this in
   four lines.
2. **A live list of pending operations** — many can be in flight at once,
   each with its own deadline; the toast bar is a derived view of that list.
3. **Cross‑cutting cancellation** — clicking undo from a toast that lives
   far from the list view must reach the right pending saga.

Each of those is awkward with hooks alone (you end up tracking
`setTimeout` IDs in `useRef`s and threading callbacks). Inside a Redux Box
module they're idiomatic.
:::

## File structure

```text
src/
  graphql/
    client.js
    posts.js
  query/
    queryClient.js
  store/
    posts.js
    index.js
  components/
    PostsPage.js
    UndoToasts.js
  App.js
  index.js
```

## The GraphQL transport

`graphql-request` is a tiny GraphQL‑over‑HTTP client — perfect when you don't
need Apollo's normalized cache because React Query is already caching for you.

```js
// src/graphql/client.js
import { GraphQLClient } from 'graphql-request';

const gqlClient = new GraphQLClient('https://example.com/graphql');

export default gqlClient;
```

```js
// src/graphql/posts.js
import { gql } from 'graphql-request';

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

## The query client (singleton)

Exporting the `QueryClient` from a module file means sagas can import and use
it directly.

```js
// src/query/queryClient.js
import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, refetchOnWindowFocus: false },
  },
});

export default queryClient;
```

## The Redux Box module — undo workflow

The module owns exactly one thing: **the list of deletes that are currently
in their undo window**. Server data still lives in React Query; per‑component
UI bits like a search input still live in `useState` (we don't drag them
into the store just because we can).

```js
// src/store/posts.js
import { createModule, createSagas } from 'redux-box';
import {
  call,
  cancelled,
  delay,
  put,
  race,
  take,
} from 'redux-saga/effects';

import gqlClient from '../graphql/client';
import { DELETE_POST } from '../graphql/posts';
import queryClient from '../query/queryClient';

const UNDO_WINDOW_MS = 5_000;
const POSTS_KEY = ['posts'];

const types = {
  REQUEST_DELETE: 'posts/REQUEST_DELETE',
  UNDO_DELETE:    'posts/UNDO_DELETE',
  DELETE_SUCCESS: 'posts/DELETE_SUCCESS',
  DELETE_FAILURE: 'posts/DELETE_FAILURE',
};

const state = {
  // { [postId]: { post, deadlineAt } }
  pending: {},
  lastError: null,
};

export const dispatchers = {
  requestDelete: post => ({ type: types.REQUEST_DELETE, post }),
  undoDelete:    id   => ({ type: types.UNDO_DELETE, id }),
};

const mutations = {
  [types.REQUEST_DELETE]: (state, { post }) => {
    state.pending[post.id] = {
      post,
      deadlineAt: Date.now() + UNDO_WINDOW_MS,
    };
    state.lastError = null;
  },
  [types.UNDO_DELETE]:    (state, { id }) => { delete state.pending[id]; },
  [types.DELETE_SUCCESS]: (state, { id }) => { delete state.pending[id]; },
  [types.DELETE_FAILURE]: (state, { id, error }) => {
    delete state.pending[id];
    state.lastError = error;
  },
};

// Snapshot the cached query data for every variant of `['posts', …]` so we
// can roll back to exactly what the user was looking at.
function snapshotPostsQueries() {
  return queryClient.getQueriesData({ queryKey: POSTS_KEY });
}

function restoreSnapshot(entries) {
  entries.forEach(([key, data]) => queryClient.setQueryData(key, data));
}

function removeFromPostsQueries(id) {
  queryClient.setQueriesData({ queryKey: POSTS_KEY }, old => {
    if (!old?.posts) return old;
    return { ...old, posts: old.posts.filter(p => p.id !== id) };
  });
}

function* watchPendingDelete({ post }) {
  const { id } = post;
  const snapshot = yield call(snapshotPostsQueries);

  // 1. Optimistically remove the post from every cached posts query, so
  //    every mounted useQuery sees it gone immediately.
  yield call(removeFromPostsQueries, id);

  try {
    // 2. Race the undo window against an UNDO action targeting this id.
    const { undo } = yield race({
      timeout: delay(UNDO_WINDOW_MS),
      undo:    take(a => a.type === types.UNDO_DELETE && a.id === id),
    });

    if (undo) {
      yield call(restoreSnapshot, snapshot);
      return;
    }

    // 3. Window elapsed — actually fire the mutation.
    yield call([gqlClient, 'request'], DELETE_POST, { id });
    yield put({ type: types.DELETE_SUCCESS, id });
  } catch (error) {
    yield call(restoreSnapshot, snapshot);
    yield put({ type: types.DELETE_FAILURE, id, error: error.message });
  } finally {
    if (yield cancelled()) {
      // Component or store was torn down mid‑race; restore to be safe.
      yield call(restoreSnapshot, snapshot);
    }
  }
}

const sagas = createSagas({
  // takeEvery — every requested delete spawns its own race.
  // takeLatest would cancel the previous worker and silently drop its undo.
  [`${types.REQUEST_DELETE}__@every`]: watchPendingDelete,
});

export const getPendingDeletes = state =>
  Object.values(state.posts.pending);
export const getPendingDeleteIds = state =>
  new Set(Object.keys(state.posts.pending));
export const getLastError = state => state.posts.lastError;

export default createModule({ state, dispatchers, mutations, sagas });
```

A few things worth calling out in that code:

- **The saga is the source of truth for "what's the optimistic cache state
  right now?"** It snapshots before mutating and restores on undo, failure,
  or cancellation — there's no bookkeeping in components.
- **Cache writes go through React Query, not Redux.** We use
  `setQueriesData` (with a query‑key prefix filter) so a single write covers
  every variant of `['posts', …]` — different search strings, paginated
  pages, etc. The Redux Box state stays small: just the pending list.
- `take(a => a.type === UNDO_DELETE && a.id === id)` is the entire
  cancellation primitive. Nothing in the component has to know about
  `setTimeout` or `clearTimeout`.

## Store setup

```js
// src/store/index.js
import { createStore } from 'redux-box';
import posts from './posts';

export default createStore({ posts });
```

## The list view

`search` lives in `useState` here — it's a per‑component concern, not
something other parts of the app share, so we don't push it into Redux. The
view filters out any post whose id is in the pending‑delete set, so the user
sees the optimistic removal immediately.

```jsx
// src/components/PostsPage.js
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { connectStore } from 'redux-box';

import gqlClient from '../graphql/client';
import { GET_POSTS } from '../graphql/posts';
import {
  dispatchers,
  getPendingDeleteIds,
} from '../store/posts';

function PostsPage({ pendingIds, requestDelete }) {
  const [search, setSearch] = useState('');

  const { data, isPending, error } = useQuery({
    queryKey: ['posts', { search }],
    queryFn:  () => gqlClient.request(GET_POSTS, { search }),
  });

  return (
    <section>
      <input
        value={search}
        placeholder="Search posts…"
        onChange={e => setSearch(e.target.value)}
      />

      {isPending && <p>Loading…</p>}
      {error     && <p role="alert">{error.message}</p>}

      <ul>
        {data?.posts
          .filter(post => !pendingIds.has(post.id))
          .map(post => (
            <li key={post.id}>
              <strong>{post.title}</strong> — {post.author.name}
              <button onClick={() => requestDelete(post)}>Delete</button>
            </li>
          ))}
      </ul>
    </section>
  );
}

export default connectStore({
  mapSelectors:   { pendingIds: getPendingDeleteIds },
  mapDispatchers: { requestDelete: dispatchers.requestDelete },
})(PostsPage);
```

## The undo toast bar

A separate component subscribes only to the pending list. It can live
anywhere in the tree — sidebar, app shell, modal layer — and still talk to
the right saga, because dispatching `undoDelete(id)` reaches the right
worker via `take`.

```jsx
// src/components/UndoToasts.js
import React, { useEffect, useState } from 'react';
import { connectStore } from 'redux-box';

import { dispatchers, getPendingDeletes } from '../store/posts';

function useNow(intervalMs = 250) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function UndoToasts({ pending, undoDelete }) {
  const now = useNow();

  if (pending.length === 0) return null;

  return (
    <div className="toast-stack" role="status">
      {pending.map(({ post, deadlineAt }) => {
        const remaining = Math.max(0, Math.ceil((deadlineAt - now) / 1000));
        return (
          <div key={post.id} className="toast">
            <span>Deleted “{post.title}”</span>
            <button onClick={() => undoDelete(post.id)}>
              Undo · {remaining}s
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default connectStore({
  mapSelectors:   { pending: getPendingDeletes },
  mapDispatchers: { undoDelete: dispatchers.undoDelete },
})(UndoToasts);
```

## App entry

Both providers wrap the tree; `UndoToasts` and `PostsPage` are siblings.

```jsx
// src/App.js
import React from 'react';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';

import store from './store';
import queryClient from './query/queryClient';
import PostsPage from './components/PostsPage';
import UndoToasts from './components/UndoToasts';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <PostsPage />
        <UndoToasts />
      </Provider>
    </QueryClientProvider>
  );
}
```

## What just happened

```text
User clicks "Delete" on post P
   └─► requestDelete(post)
         └─► dispatch { type: REQUEST_DELETE, post }
               ├─► reducer: pending[P.id] = { post, deadlineAt: now + 5s }
               │                                    ▲
               │   UndoToasts re-renders, shows ────┘
               │   "Deleted 'P' — Undo · 5s"
               │
               └─► saga: snapshot ['posts', …] queries
                         setQueriesData → P removed from cache
                         (PostsPage re-renders without P)
                         race({ delay(5s), take(UNDO of P) })

   ── Path A: user clicks "Undo" within 5s ──
     dispatch { type: UNDO_DELETE, id: P.id }
       ├─► reducer: delete pending[P.id]   (toast disappears)
       └─► saga's `take` wins the race
             └─► restoreSnapshot()    (P reappears in the list)

   ── Path B: 5 seconds elapse ──
     saga's `delay` wins the race
       └─► gqlClient.request(DELETE_POST, { id: P.id })
            ├─ on success → dispatch { type: DELETE_SUCCESS, id }
            │                └─► reducer: delete pending[P.id]
            │                            (toast disappears; cache already without P)
            └─ on failure → restoreSnapshot()
                            dispatch { type: DELETE_FAILURE, id, error }
                              └─► reducer: lastError = error
```

## Why this layer is hard to remove

You could try to write the same flow with `useMutation` plus a `useRef`
holding `setTimeout` IDs and a context for the toast list — and you'd end
up rebuilding a worse version of `race(delay, take)` and a worse version of
the pending‑deletes selector. Once the workflow has

- a **timer that can be cancelled** by a user action that may originate from
  a different part of the tree, *and*
- a **list of in‑flight operations** that's read by multiple components
  (the dimmed list and the toast stack), *and*
- a **single place** that owns optimistic cache writes and their rollback,

a saga + a tiny module is the smaller, more testable design. For the
ordinary "spinner + toast" mutation, stick with `useMutation`.

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
thin singleton. Swapping React Query for Apollo (or REST, or gRPC‑Web) is a
local change to the saga and the component, never to the module's contract.

If you'd like to see the simpler "spinner + toast" shape with a normalized
cache, head over to the [Apollo example](/graphql-apollo.html).
