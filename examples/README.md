# Redux Box Examples

Two end-to-end example apps that use real, publicly available APIs to show how
Redux Box scales beyond a counter. Each example is a self-contained TypeScript
project — its own `package.json`, build, and test suite — so you can copy the
folder into a new repo and start hacking.

> **Live demos** — every push to `master` rebuilds and deploys both apps via the
> [`Deploy Examples`](../.github/workflows/deploy-examples.yml) GitHub Action:
>
> - https://anish000kumar.github.io/redux-box/examples/ — landing page
> - https://anish000kumar.github.io/redux-box/examples/crud-rest/
> - https://anish000kumar.github.io/redux-box/examples/trello-graphql/
>
> **PR gates** — [`PR Tests`](../.github/workflows/main.yml) blocks merging
> until the library tests + build, the docs build, and a production build of
> _both_ examples all pass — so a green PR really does mean nothing on
> `master` is broken.

| Example                      | API                                                                                       | What it demonstrates                                                                                                                                                                                       |
| ---------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`crud-rest`](./crud-rest)   | [JSONPlaceholder](https://jsonplaceholder.typicode.com/) (REST)                           | Full CRUD: list, create, edit, delete posts. Optimistic updates with rollback, debounced search, ID-keyed normalised state, eager + lazy selectors, React Testing Library coverage of the connected views. |
| [`trello-graphql`](./trello-graphql) | [GraphQL Zero](https://graphqlzero.almansi.me/) (GraphQL — JSONPlaceholder for GraphQL) | Trello-style board with three columns (Todo / In&nbsp;Progress / Done). Move cards with HTML5 drag-and-drop, add/edit/delete cards, optimistic mutations, normalised board state, mocked GraphQL transport in tests. |

Both examples share the same architectural conventions, so once you've
understood one, the other is a small step:

```text
src/
  api/  ↦  graphql/        thin transport layer (one file = one concern)
  store/
    <feature>/
      types.ts             action-type constants and TS types
      state.ts             initial state shape
      mutations.ts         immer-powered reducer pieces
      dispatchers.ts       pure action creators
      selectors.ts         eager + lazy selectors built with module helpers
      sagas.ts             redux-saga workers + createSagas() watchers
      index.ts             createModule({ ... }) wiring
    index.ts               createStore({ ... }) wiring
  components/              connected + presentational React components
  hooks/                   small reusable hooks (e.g. useDebounce)
  App.tsx
  main.tsx
tests/
  api/  ↦  graphql/        transport tests with fetch mocked
  store/<feature>/         per-segment tests: mutations, selectors, sagas
  components/              user-centric React Testing Library tests
```

## Running an example

```bash
# build the local redux-box dist (needed because each example links to
# this repo via `"redux-box": "file:../.."`)
npm run build --prefix ../..

cd examples/crud-rest        # or examples/trello-graphql
npm install --ignore-scripts # parent's husky prepare script touches the
                             # repo's .git/config; --ignore-scripts skips it
npm run typecheck            # tsc --noEmit
npm run test                 # unit + integration tests with coverage
npm run dev                  # start the Vite dev server
```

By default each example's `package.json` points at the local source via
`"redux-box": "file:../.."` so the examples always exercise the in-tree
version of the library. If you copy an example out of this repo to use as a
starter, swap that entry for the published version:

```jsonc
"redux-box": "^2.1.0"
```

…and run `npm install` again.

### Why the React deduplication?

Both Jest configs map `react`, `react-dom` and `react-redux` to the
example's own `node_modules`. When `redux-box` is symlinked via
`file:../..` the linked package's transitive React would otherwise load
a *second* copy alongside the example's React, and react-redux's hooks
throw `Cannot read properties of null (reading 'useMemo')` the moment
two copies run in the same render. The mapping in `jest.config.cjs`
forces one copy.

## Why this folder structure?

A few principles guide the layout:

- **One concern per file.** Action types, mutations, sagas, dispatchers and
  selectors each get their own file. Modules grow without anyone needing to
  scroll past 400-line `index.ts` blobs.
- **Slice-decoupled selectors.** Selectors are built with `module.select` and
  `module.lazySelect`, so renaming a slice in `createStore({ ... })` never
  cascades into a refactor.
- **API code stays out of the module.** Sagas reach for a thin client layer
  (`api/` for REST, `graphql/` for GraphQL). The module knows nothing about
  HTTP, which keeps reducers + sagas trivially testable with mocked fetch.
- **Optimistic UI is the default.** Cards/posts disappear and update
  instantly; failures roll back and surface a toast. This is the pattern that
  makes Redux Box's saga-first design pay off.
- **Tests follow the same shape as the source.** Each `src/<dir>/<file>.ts`
  has a sibling test under `tests/<dir>/<file>.test.ts`, so coverage gaps are
  visible at a glance.

For the conceptual background, head back to the
[Redux Box docs](../docs/core-concepts.md). For testing patterns, the
[Testing](../docs/testing-practises.md) page is a good companion read.
