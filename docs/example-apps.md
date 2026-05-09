# Production-shaped example apps

The toy snippets earlier in this section (the counter, async fetch, Apollo /
React Query setups) get you the moving parts in isolation. Once you want to
see how those moving parts compose into a real app — folder layout, optimistic
UI, normalised state, sagas talking to a real network, React Testing Library
coverage of connected views — the [`examples/`](https://github.com/anish000kumar/redux-box/tree/master/examples)
folder in the repo has two end-to-end apps you can read, run, and lift
wholesale into your own project.

Both ship as their own self-contained TypeScript projects (own `package.json`,
build, and test suite) so you can copy a folder out and start hacking. Both
are deployed on every push to `master` via the
[`Deploy Site`](https://github.com/anish000kumar/redux-box/actions/workflows/deploy-site.yml)
GitHub Action — which builds this docs site and both example apps and
publishes them as a single GitHub Pages artefact — and a PR cannot land
until production builds of both apps, plus this docs site and the library
tests, go green.

## CRUD over REST — `examples/crud-rest`

> Live: <https://anish000kumar.github.io/redux-box/examples/crud-rest/> &nbsp;·&nbsp;
> Source: [`examples/crud-rest/`](https://github.com/anish000kumar/redux-box/tree/master/examples/crud-rest)

Full CRUD against [JSONPlaceholder](https://jsonplaceholder.typicode.com/):
list, create, edit, and delete posts.

Features worth reading the source for:

- **Normalised state with `XhrState<T>` per operation.** The `posts` slice has
  separate `list`, `create`, `update`, and `remove` slots, each carrying
  `{ data, loading, error }`. Selectors aggregate "any save in flight" /
  "first error" without the slice having to know.
- **Optimistic mutations with rollback.** Sagas dispatch a `*_PENDING`
  action that mutates state immediately, fire the request, and either
  confirm with `*_FULFILLED` or roll back with `*_REJECTED` — and the UI
  saga turns rejections into toasts.
- **Intent vs. lifecycle actions.** Components dispatch `posts/CREATE`
  ("the user pressed save"); sagas own `posts/CREATE_PENDING`,
  `posts/CREATE_FULFILLED`, `posts/CREATE_REJECTED` ("here is the state
  transition"). Reducers only see lifecycle actions, which keeps mutations
  trivially testable.
- **Slice-decoupled selectors.** Built with `module.select` /
  `module.lazySelect`, so the consumer never references `state.posts` by
  name and renaming the slice at `createStore` time is a one-line change.
- **Connected-view tests.** React Testing Library exercises `<PostList />`
  and `<PostForm />` against a real store, with `fetch` mocked at the
  transport boundary.

## Trello-style board over GraphQL — `examples/trello-graphql`

> Live: <https://anish000kumar.github.io/redux-box/examples/trello-graphql/> &nbsp;·&nbsp;
> Source: [`examples/trello-graphql/`](https://github.com/anish000kumar/redux-box/tree/master/examples/trello-graphql)

A three-column board (Todo / In&nbsp;Progress / Done) backed by
[GraphQL Zero](https://graphqlzero.almansi.me/). Cards can be created,
renamed, deleted, and dragged between columns; every mutation is
optimistic.

What it adds on top of the REST example:

- **GraphQL transport.** A tiny `graphql/` client wraps `fetch`; sagas
  call typed query / mutation helpers and never touch HTTP themselves.
- **HTML5 drag-and-drop.** `<Card />` and `<Column />` wire up native
  `dragstart` / `dragover` / `drop` handlers; UI state (which card is
  being dragged, which column is the drop target) lives in a small `ui`
  module so the board module stays a pure data store.
- **Pending-overlay UX.** Cards being saved render with a `pending`
  flag pulled from a `pendingIds` map on the slice; the saga clears the
  flag on `*_FULFILLED` / `*_REJECTED` and the column re-renders
  automatically because the lookup runs through an eager selector that
  sees the slice change.
- **Mocked GraphQL in tests.** The same `gqlRequest` helper used in
  production is `jest.mock`-ed in the integration tests, so the saga
  pipeline is exercised end-to-end without a real network.

## Shared conventions

Both apps follow the same per-module layout — useful as a cargo-cult
starting point in your own codebase:

```text
src/
  api/  ↦  graphql/      thin transport layer (one file = one concern)
  store/
    <feature>/
      types.ts           action-type constants and TS types
      state.ts           initial state shape
      mutations.ts       immer-powered reducer pieces
      dispatchers.ts     pure action creators
      selectors.ts       eager + lazy selectors built with module helpers
      sagas.ts           redux-saga workers + createSagas() watchers
      index.ts           createModule({ ... }) wiring
    index.ts             createStore({ ... }) wiring
  components/            connected + presentational React components
  hooks/                 small reusable hooks (e.g. useDebounce)
tests/
  api/  ↦  graphql/      transport tests with fetch mocked
  store/<feature>/       per-segment tests: mutations, selectors, sagas
  components/            user-centric React Testing Library tests
```

The principles behind that layout — one concern per file, slice-decoupled
selectors, API code outside the module, optimistic UI as the default,
tests mirroring source structure — are spelled out in the
[`examples/README.md`](https://github.com/anish000kumar/redux-box/blob/master/examples/README.md)
in the repo.

## Running them locally

```bash
git clone https://github.com/anish000kumar/redux-box.git
cd redux-box
npm install --ignore-scripts
npm run build               # builds the redux-box dist the examples link to

cd examples/crud-rest       # or examples/trello-graphql
npm install --ignore-scripts
npm run dev                 # Vite dev server
npm test                    # Jest, with coverage
npm run build               # production build (what CI deploys)
```

Each example's `package.json` links the library via `"redux-box": "file:../.."`
so you're always running the in-tree version. To use one as a starter
project, swap that entry for the published version:

```jsonc
"redux-box": "^2.1.0"
```

…and run `npm install` again.
