# `trello-graphql` — Trello-style board on a public GraphQL API

A drag-and-drop kanban board built on Redux Box, redux-saga, TypeScript and
[GraphQL Zero](https://graphqlzero.almansi.me/) — a free public GraphQL
playground that mirrors JSONPlaceholder. We model `todos` as Trello cards and
group them into three columns: **To Do**, **In Progress** and **Done**.

What's worth studying:

| Pattern                                              | Where to look                                     |
| ---------------------------------------------------- | ------------------------------------------------- |
| HTML5 drag-and-drop wired to a `MOVE` saga           | `src/components/Card.tsx` + `Column.tsx`          |
| Optimistic move with snapshot + rollback             | `src/store/board/sagas.ts` (`moveCardWorker`)     |
| Skipping the network call when no field changes     | `src/store/board/sagas.ts` (same-`completed` short-circuit) |
| Column-level normalised state (`columns` + `byId`)   | `src/store/board/state.ts`                        |
| Optimistic create with temp id reconciliation        | `src/store/board/sagas.ts` (`createCardWorker`)   |
| Per-card `pendingIds` flag + lazy `getIsCardPending` | `src/store/board/selectors.ts`                    |
| Tiny zero-dep GraphQL client                         | `src/graphql/client.ts`                           |
| Cross-module saga (UI reacts to board lifecycle)     | `src/store/ui/sagas.ts`                           |

## Getting started

```bash
# build the local redux-box dist (needed because this example links
# against `"redux-box": "file:../.."`)
npm run build --prefix ../..

cd examples/trello-graphql
npm install --ignore-scripts
npm run dev          # http://localhost:5174
```

The dev server talks directly to `https://graphqlzero.almansi.me/api`.
Mutations are accepted but not persisted on the server (it's a fake API),
so the snapshot/rollback paths can be exercised without affecting anyone.

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

| Layer        | Files                                                | What it covers                                                                       |
| ------------ | ---------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Transport    | `tests/graphql/client.test.ts`                       | URL + headers + body shape, HTTP errors, GraphQL errors, missing data                |
| Mutations    | `tests/store/board/mutations.test.ts`                | Each mutation; create / rename / move / delete; rollback for every failure path      |
| Selectors    | `tests/store/board/selectors.test.ts`                | Eager + lazy selectors; slice-keyed memoisation                                      |
| Sagas        | `tests/store/board/sagas.test.ts`                    | Manual `.next()` walk-through; happy + sad paths; same-`completed` short-circuit     |
| Integration  | `tests/store/board/integration.test.ts`              | Real store + real saga + mocked GraphQL; full optimistic + rollback coverage         |
| UI module    | `tests/store/ui/mutations.test.ts`                   | New-card form, rename, drag bookkeeping, toast lifecycle                             |
| Components   | `tests/components/Board.test.tsx` + `CardForm.test.tsx` | RTL + userEvent; HTML5 drag-and-drop simulation; create/rename/delete user flows  |

## Folder layout

```text
src/
  graphql/
    client.ts           tiny fetch-based GraphQL client (Promise<T>)
    documents.ts        queries, mutations, response types
  store/
    board/
      types.ts          intent + lifecycle action-type constants + ColumnId enum
      state.ts          BoardState (byId, columns, pendingIds), Card type
      dispatchers.ts    pure action creators (intent only)
      mutations.ts      reducer pieces (immer, optimistic + rollback)
      sagas.ts          fetch / create / rename / delete / move workers
      selectors.ts      eager + lazy selectors via module.select / .lazySelect
      index.ts          createModule({ ... })
    ui/                 new-card / rename / confirm-delete / drag / toast state
    index.ts            createStore({ board, ui })
  components/
    Board.tsx           connected; renders the three columns
    Column.tsx          connected; receives column id, exposes drop target
    Card.tsx            memoised; HTML5 draggable + inline rename mode
    CardForm.tsx        connected; new-card modal
    ConfirmDialog.tsx   connected; delete confirmation
    Toast.tsx           connected; auto-dismiss success / error toast
  styles/app.css
  App.tsx
  main.tsx
tests/                  mirrors src/ 1:1
```

## Why three columns when the API only knows `completed`?

GraphQL Zero exposes `todo.completed: boolean` and nothing more. Three
columns ("To Do", "In Progress", "Done") need an extra distinction the
server can't represent. The convention here is:

- `done` ⇄ `completed: true`
- `todo` and `in-progress` ⇄ `completed: false`

Moves between `todo` and `in-progress` therefore **don't need a network
call** — the saga short-circuits with a `MOVE_FULFILLED` immediately. Only
moves that cross the "completed" boundary fire an `updateTodo` mutation.

This is a real pattern: client-side categorisation often lives "above" the
server's data model. The saga is the right place to translate the rich
client move into the server's narrower concept.

## Why HTML5 drag-and-drop instead of a library?

`react-dnd`, `@dnd-kit/*`, `react-beautiful-dnd` are all great. None of
them is required for an example: HTML5's native drag-and-drop gets us a
real implementation in ~30 lines, lets the test suite simulate drops with
a synthetic `DragEvent`, and keeps the bundle tiny.

For production, swap to `@dnd-kit/core` if you need keyboard
accessibility, virtualised lists, or animated reordering — the saga and
module API stay identical.

## Comparing the two examples

The Redux Box layer is the same shape in both `crud-rest` and
`trello-graphql`: intent dispatchers, lifecycle actions, optimistic
reducers, snapshot/rollback sagas, slice-decoupled selectors. The only
thing that changes is the transport (`fetch` vs `gqlRequest`). That's the
take-away — the module's contract has nothing to do with HTTP, REST or
GraphQL, so swapping transports is a localised diff.
