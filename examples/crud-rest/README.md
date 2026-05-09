# `crud-rest` — Complete CRUD on a public REST API

A small but production-shaped Redux Box app that talks to
[JSONPlaceholder](https://jsonplaceholder.typicode.com) — a free public
fake REST API for posts, comments, users and todos.

What's worth studying:

| Pattern                                | Where to look                                           |
| -------------------------------------- | ------------------------------------------------------- |
| Optimistic create / update / delete    | `src/store/posts/sagas.ts` + `mutations.ts`             |
| Rollback with snapshots                | `src/store/posts/sagas.ts` (UPDATE_REJECTED, DELETE_REJECTED) |
| Normalised `byId` / `allIds` state     | `src/store/posts/state.ts`                              |
| Slice-decoupled selectors              | `src/store/posts/selectors.ts` (uses `module.select` / `module.lazySelect`) |
| Cross-module saga (toasts on lifecycle)| `src/store/ui/sagas.ts`                                 |
| Stable lazy callables in `React.memo`  | `src/components/PostList.tsx` + `PostItem.tsx`          |
| Debounced search via lazy selector     | `src/components/PostList.tsx` + `hooks/useDebounce.ts`  |

## Getting started

```bash
# build the local redux-box dist (needed because this example links
# against `"redux-box": "file:../.."`)
npm run build --prefix ../..

cd examples/crud-rest
npm install --ignore-scripts
npm run dev          # http://localhost:5173
```

## Running the tests

```bash
npm test             # full suite, with coverage
npm run test:watch   # interactive
npm run typecheck    # tsc --noEmit
```

> The Jest config maps `react`, `react-dom` and `react-redux` to this
> example's own `node_modules`. Without that mapping, the linked
> `redux-box` (via `file:../..`) would pull in a duplicate React from
> the parent repo and react-redux's hooks would crash with
> `useMemo of null`.

The test suite is layered:

| Layer        | Files                                              | What it covers                                                         |
| ------------ | -------------------------------------------------- | ---------------------------------------------------------------------- |
| API          | `tests/api/posts.test.ts`                          | `fetch` is mocked; URL, method, body and error mapping all asserted    |
| Mutations    | `tests/store/posts/mutations.test.ts`              | Each mutation is run through immer; immutability and rollback verified |
| Selectors    | `tests/store/posts/selectors.test.ts`              | Eager + lazy selectors over fixture state; reselect memoisation        |
| Sagas        | `tests/store/posts/sagas.test.ts`                  | Manual `.next()` walk-through; happy + sad paths; non-Error fallback   |
| Integration  | `tests/store/posts/integration.test.ts`            | Real store + real saga + mocked API; full optimistic/rollback flow     |
| UI module    | `tests/store/ui/mutations.test.ts`                 | Search, modals, toast lifecycle                                        |
| Components   | `tests/components/*.test.tsx`                      | RTL + userEvent; debounce timing; create/edit/delete flows             |

## Folder layout

```text
src/
  api/
    client.ts           fetch wrapper + ApiError + base URL
    posts.ts            list / get / create / update / remove
  store/
    posts/
      types.ts          intent + lifecycle action-type constants
      state.ts          PostsState shape (normalised byId / allIds)
      dispatchers.ts    pure action creators (intent only)
      mutations.ts      reducer pieces (immer, optimistic + rollback)
      sagas.ts          fetch / create / update / delete workers
      selectors.ts      eager + lazy selectors via module.select / .lazySelect
      index.ts          createModule({ ... })
    ui/                 ditto for search / modal / toast state
    index.ts            createStore({ posts, ui })
  components/
    PostList.tsx        connected list view + search box
    PostItem.tsx        memoised row with edit / delete actions
    PostForm.tsx        connected create + edit modal
    ConfirmDialog.tsx   delete-confirmation modal
    Toast.tsx           auto-dismissing success / error toast
  hooks/
    useDebounce.ts
  styles/app.css
  App.tsx
  main.tsx
tests/                  mirrors src/ 1:1
```

## Why JSONPlaceholder?

JSONPlaceholder is one of the few public APIs that:

- Supports the full set of REST verbs (GET / POST / PUT / PATCH / DELETE).
- Returns realistic, structured JSON (`id`, `userId`, `title`, `body`).
- Requires no API key, CORS works from the browser, and rate limits are
  generous enough for a hot-reload dev workflow.

Mutation responses come back **as if the change had been persisted**, but
the server doesn't actually remember them between requests. That's perfect
for an example — we get to exercise the saga's optimistic + rollback paths
without touching anyone else's data.

## What this example deliberately leaves out

- **Pagination / infinite scroll.** Easy to layer on top of the existing
  `byId` state, but adds noise to the saga story.
- **Routing.** Single-page editor + list keeps the component graph small.
- **Authentication.** JSONPlaceholder doesn't require it; if your API does,
  a token interceptor belongs in `src/api/client.ts`.

If you want to see an example that *does* coordinate with a real cache and
optimistic mutations across queries, the
[`trello-graphql`](../trello-graphql) example does the same thing on top of
GraphQL.
