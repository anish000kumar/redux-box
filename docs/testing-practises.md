# Testing

Redux Box modules are easy to test because each segment is a plain function
or generator: you can exercise dispatchers, mutations (the reducer), sagas,
and selectors in complete isolation, with no rendering or store setup
required.

This page assumes [Jest](https://jestjs.io/) but the patterns translate
directly to Vitest, Mocha, or anything else that runs JavaScript.

[[toc]]

## What to test, and how

A Redux Box module is built from four kinds of plain values:

| Segment       | What it is                              | How to test it                                                   |
| ------------- | --------------------------------------- | ---------------------------------------------------------------- |
| `dispatchers` | pure functions returning action objects | call them, assert on the returned object                         |
| `mutations`   | reducer pieces (Immer drafts)           | run them through the module's reducer and assert on next state   |
| `selectors`   | pure functions of state                 | feed them a state fixture, assert the output                     |
| `sagas`       | generators                              | step manually with `.next()` / `.throw()`, or use a runner       |

Use unit tests for the segments, then add a thin integration layer that
dispatches against a real store as a smoke test.

## Setting up

Nothing about Redux Box requires special setup. The repo's own tests use:

```js
// jest.config.js
module.exports = {
  moduleFileExtensions: ['js', 'jsx', 'json'],
  testEnvironment: 'jsdom',
};
```

If you only test reducers, sagas, and selectors (no DOM), you can switch
`testEnvironment` to `'node'` for a small speedup.

For saga unit tests you'll also want:

```bash
yarn add --dev redux-saga-test-plan @redux-saga/testing-utils
```

Both are optional — the manual `.next()` style needs no extra dependencies —
but each unlocks a different style of test, covered below.

## Testing dispatchers

Dispatchers are the simplest thing in the codebase to test: they're pure
functions returning plain action objects.

```js
import { dispatchers } from '../src/store/counter';

test('incrementBy returns the right action', () => {
  expect(dispatchers.incrementBy(5)).toEqual({
    type: 'counter/INCREMENT_BY',
    amount: 5,
  });
});

test('reset takes no arguments', () => {
  expect(dispatchers.reset()).toEqual({ type: 'counter/RESET' });
});
```

Two things worth asserting:

- The exact `type` string (so a typo can't drift between the dispatcher and
  the mutation).
- That every argument the dispatcher accepts ends up on the action, with
  the key the rest of the system expects.

::: tip Snapshots are tempting, but…
`toMatchSnapshot()` will work on action objects, but it makes typo
regressions harder to spot in code review. Prefer `toEqual` so the test
itself documents the wire format.
:::

## Testing mutations (the reducer)

Redux Box turns the `mutations` object into a real reducer using Immer.
There are two ways to test them, depending on how much of Redux Box you
want to involve.

### Option 1: build a tiny reducer wrapper next to your module

This is the most realistic — it tests the same code path Redux Box runs
in production.

```js
// src/store/counter.js
import { produce } from 'immer';
import { createModule } from 'redux-box';

export const initialState = { count: 0 };

export const mutations = {
  'counter/INCREMENT': state => { state.count += 1; },
  'counter/INCREMENT_BY': (state, action) => { state.count += action.amount; },
};

export const reducer = (state = initialState, action) =>
  produce(state, draft => {
    const m = mutations[action.type];
    if (m) m(draft, action);
  });

export default createModule({ state: initialState, mutations });
```

```js
import { reducer, initialState } from '../src/store/counter';

test('INCREMENT bumps count', () => {
  const next = reducer(initialState, { type: 'counter/INCREMENT' });

  expect(next.count).toBe(1);
  expect(initialState.count).toBe(0); // immutability check
});

test('INCREMENT_BY uses the action payload', () => {
  const next = reducer({ count: 10 }, { type: 'counter/INCREMENT_BY', amount: 5 });

  expect(next.count).toBe(15);
});

test('unknown action returns the same reference', () => {
  const next = reducer(initialState, { type: 'unknown' });

  expect(next).toBe(initialState);
});
```

::: tip Why assert on the same reference?
Immer's `produce` only allocates a new object when the draft was actually
modified. For unrelated actions, the previous state is returned by
reference — exactly what `react-redux`'s `===` check needs to skip a
render. Asserting on this guards against accidental "I returned a new
object every time" bugs.
:::

### Option 2: call mutations directly

If you don't want to expose a `reducer` from the module file, run the
mutation through Immer yourself:

```js
import { produce } from 'immer';
import { mutations, initialState } from '../src/store/counter';

function applyMutation(state, action) {
  return produce(state, draft => mutations[action.type](draft, action));
}

test('INCREMENT bumps count', () => {
  expect(applyMutation(initialState, { type: 'counter/INCREMENT' }))
    .toEqual({ count: 1 });
});
```

This skips the `if (mutations[action.type])` guard, so it's a stricter
test: it fails if you forget to register the mutation key at all.

### Option 3: use `getReducer` directly

Redux Box exposes the same helper it uses internally. You can build a
real reducer from the module's mutations:

```js
import getReducer from 'redux-box/dist/getReducer';
import counter, { initialState, mutations } from '../src/store/counter';

const reducer = getReducer(mutations, initialState);

test('reducer behaves like the one Redux Box wires up', () => {
  expect(reducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  expect(reducer(initialState, { type: 'counter/INCREMENT' })).toEqual({ count: 1 });
});
```

Use whichever fits your project — most teams stick with Option 1.

### Patterns to cover

For every mutation, write at least one test for:

- **The happy path** — the input action produces the expected next state.
- **Argument routing** — if the action carries a payload, assert it lands
  in the right place.
- **No-op / unknown actions** — the previous state reference is returned.
- **Reference identity** — for nested objects/arrays you don't touch, the
  inner reference should be preserved (Immer guarantees this).

```js
test('updating one field does not clone untouched arrays', () => {
  const state = { items: [1, 2, 3], isLoading: false };

  const next = reducer(state, { type: 'posts/SET_LOADING', value: true });

  expect(next.isLoading).toBe(true);
  expect(next.items).toBe(state.items); // still the same array reference
});
```

## Testing selectors

Selectors are functions of state — feed them a fixture and assert the
output.

```js
import {
  getItemCount,
  getPublishedItems,
  getPostById,
} from '../src/store/posts';

const state = {
  posts: {
    items: [
      { id: 1, title: 'Hi',  published: true  },
      { id: 2, title: 'Wip', published: false },
    ],
  },
};

test('getItemCount counts all items', () => {
  expect(getItemCount(state)).toBe(2);
});

test('getPublishedItems filters to published posts', () => {
  expect(getPublishedItems(state)).toEqual([
    { id: 1, title: 'Hi', published: true },
  ]);
});

test('getPostById returns the matching post', () => {
  expect(getPostById(state, 1)).toEqual(state.posts.items[0]);
  expect(getPostById(state, 99)).toBeUndefined();
});
```

### Asserting `reselect` memoization

If you build selectors with `createSelector`, the test is also a great
place to lock in memoization:

```js
import { getPublishedItems } from '../src/store/posts';

beforeEach(() => {
  // reselect's instrumentation is per-selector, so reset between tests
  getPublishedItems.resetRecomputations();
});

test('does not recompute when the items array reference is unchanged', () => {
  const state = { posts: { items: [{ id: 1, published: true }] } };

  getPublishedItems(state);
  getPublishedItems(state); // same reference
  getPublishedItems({ ...state }); // new outer object, same inner items

  expect(getPublishedItems.recomputations()).toBe(1);
});

test('recomputes when items change', () => {
  const a = { posts: { items: [{ id: 1, published: true }] } };
  const b = { posts: { items: [{ id: 1, published: true }, { id: 2, published: true }] } };

  getPublishedItems(a);
  getPublishedItems(b);

  expect(getPublishedItems.recomputations()).toBe(2);
});
```

A failing memoization test usually means a selector is returning a freshly
constructed object/array on every call. That cascades into needless
re-renders downstream.

### Selectors that take parameters

If a selector accepts arguments beyond `state`, pass them through directly
in the test:

```js
test('getPostsByAuthor filters by author id', () => {
  expect(getPostsByAuthor(state, 'alice')).toHaveLength(2);
  expect(getPostsByAuthor(state, 'unknown')).toEqual([]);
});
```

Memoizing parameterised selectors needs a per-instance cache (e.g.
`reselect`'s `createSelectorCreator` with a custom equality, or
`re-reselect`). Test the cached behaviour the same way as above, just
with the extra arguments.

## Testing sagas

Sagas are the most subtle piece, but they're also the most rewarding to
test — generators are deterministic, and `redux-saga` only cares about
the **effect descriptions** they yield, not what side effects actually
happen. That means saga tests can be 100% synchronous and dependency-free.

The patterns below are ordered from "no extra dependencies, very explicit"
to "high-level integration test". Pick whichever matches the level of
abstraction you're comfortable with — many codebases use a mix.

### Approach 1: step the generator manually

This is the [canonical pattern from the redux-saga docs](https://redux-saga.js.org/docs/advanced/Testing.html).
You drive the generator yourself with `.next()` and assert on each
yielded effect description.

```js
import { call, put } from 'redux-saga/effects';

import * as api from '../src/api/posts';

function* fetchPosts() {
  try {
    const posts = yield call(api.fetchPosts);
    yield put({ type: 'posts/FETCH_SUCCESS', posts });
  } catch (error) {
    yield put({ type: 'posts/FETCH_FAILURE', error: error.message });
  }
}

test('fetchPosts dispatches SUCCESS on a successful response', () => {
  const gen = fetchPosts();

  // 1. yields a `call` describing the API request
  expect(gen.next().value).toEqual(call(api.fetchPosts));

  // 2. we feed back a fake result and assert the next yielded effect
  const fakePosts = [{ id: 1, title: 'Hi' }];
  expect(gen.next(fakePosts).value).toEqual(
    put({ type: 'posts/FETCH_SUCCESS', posts: fakePosts }),
  );

  // 3. saga completes
  expect(gen.next().done).toBe(true);
});
```

Three things make this work:

- `call(fn, ...args)` returns a **plain object** describing the effect.
  It does **not** call `fn`. So `expect(...).toEqual(call(api.fetchPosts))`
  is comparing two plain objects — no mocking required.
- The argument you pass to `gen.next(fakePosts)` is the value the `yield`
  expression returns inside the generator. That's how you inject fake
  results without touching `api.fetchPosts` itself.
- `gen.next().done` confirms the saga actually finished (and didn't have
  trailing yields you forgot to assert on).

#### Errors: use `gen.throw(err)`

To exercise the `catch` branch, instead of feeding back a value, throw
into the generator at the point of the `call`:

```js
test('fetchPosts dispatches FAILURE when the API rejects', () => {
  const gen = fetchPosts();

  gen.next(); // advance to the call(api.fetchPosts)

  const err = new Error('boom');
  expect(gen.throw(err).value).toEqual(
    put({ type: 'posts/FETCH_FAILURE', error: 'boom' }),
  );
  expect(gen.next().done).toBe(true);
});
```

#### Cancellation: use `gen.return()`

If your saga has a `try / finally` cancellation block, simulate
cancellation by calling `gen.return()`:

```js
import { cancelled, put } from 'redux-saga/effects';

function* fetchPosts() {
  try {
    // …
  } finally {
    if (yield cancelled()) {
      yield put({ type: 'posts/FETCH_CANCELLED' });
    }
  }
}

test('fetchPosts dispatches CANCELLED when interrupted', () => {
  const gen = fetchPosts();
  gen.next();                                 // call(api.fetchPosts)
  expect(gen.return().value).toEqual(cancelled());
  expect(gen.next(true).value).toEqual(
    put({ type: 'posts/FETCH_CANCELLED' }),
  );
  expect(gen.next().done).toBe(true);
});
```

::: warning Don't compare effects across redux-saga versions
`call(fn)` and `put(action)` produce shapes that are stable inside a major
version of `redux-saga` but aren't part of the public contract — if you
upgrade across majors, prefer `redux-saga-test-plan` or `runSaga`
(below) for tests that don't break.
:::

### Approach 2: branching with `cloneableGenerator`

Manual stepping gets repetitive when a saga has multiple branches
(`if/else`, multiple `try/catch`s) and the prefix is long. The
`cloneableGenerator` helper from `@redux-saga/testing-utils` lets you
run the prefix once and clone before each branch.

```js
import { cloneableGenerator } from '@redux-saga/testing-utils';
import { call, put, select } from 'redux-saga/effects';

import * as api from '../src/api/posts';
import { getAuthToken } from '../src/store/session';

function* fetchPosts() {
  const token = yield select(getAuthToken);

  if (!token) {
    yield put({ type: 'session/REQUIRE_LOGIN' });
    return;
  }

  try {
    const posts = yield call(api.fetchPosts, token);
    yield put({ type: 'posts/FETCH_SUCCESS', posts });
  } catch (error) {
    yield put({ type: 'posts/FETCH_FAILURE', error: error.message });
  }
}

describe('fetchPosts', () => {
  const gen = cloneableGenerator(fetchPosts)();

  // shared prefix
  it('first selects the auth token', () => {
    expect(gen.next().value).toEqual(select(getAuthToken));
  });

  it('redirects to login when there is no token', () => {
    const clone = gen.clone();
    expect(clone.next(null).value).toEqual(
      put({ type: 'session/REQUIRE_LOGIN' }),
    );
    expect(clone.next().done).toBe(true);
  });

  it('fetches when a token is present', () => {
    const clone = gen.clone();
    expect(clone.next('tok-123').value).toEqual(call(api.fetchPosts, 'tok-123'));
    expect(clone.next([{ id: 1 }]).value).toEqual(
      put({ type: 'posts/FETCH_SUCCESS', posts: [{ id: 1 }] }),
    );
    expect(clone.next().done).toBe(true);
  });

  it('fails gracefully when the API throws', () => {
    const clone = gen.clone();
    clone.next('tok-123');                                  // select → call
    expect(clone.throw(new Error('nope')).value).toEqual(
      put({ type: 'posts/FETCH_FAILURE', error: 'nope' }),
    );
    expect(clone.next().done).toBe(true);
  });
});
```

`gen.clone()` snapshots both the generator state **and** anything you've
fed it via `.next(value)`, so each branch is independent.

### Approach 3: run the saga end-to-end with `runSaga`

Stepping yields by hand asserts on the right things, but it can be
brittle: if you reorder two `put`s, you have to update every assertion.
For a more behavioural style, run the saga and capture what it
dispatched. Redux-saga ships `runSaga` exactly for this.

```js
import { runSaga } from 'redux-saga';

import * as api from '../src/api/posts';

async function recordSaga(saga, initialAction, getState = () => ({})) {
  const dispatched = [];
  await runSaga(
    {
      dispatch: action => dispatched.push(action),
      getState,
    },
    saga,
    initialAction,
  ).toPromise();
  return dispatched;
}

test('fetchPosts dispatches SUCCESS', async () => {
  jest.spyOn(api, 'fetchPosts').mockResolvedValue([{ id: 1 }]);

  const dispatched = await recordSaga(fetchPosts);

  expect(dispatched).toContainEqual({
    type: 'posts/FETCH_SUCCESS',
    posts: [{ id: 1 }],
  });
});

test('fetchPosts dispatches FAILURE', async () => {
  jest.spyOn(api, 'fetchPosts').mockRejectedValue(new Error('boom'));

  const dispatched = await recordSaga(fetchPosts);

  expect(dispatched).toContainEqual({
    type: 'posts/FETCH_FAILURE',
    error: 'boom',
  });
});
```

This style:

- Uses real `call` resolution — you mock the underlying module instead
  of the effect. That's closer to "what would actually happen".
- Doesn't care about the order or count of unrelated yields.
- Plays nicely with `async/await` — perfect for sagas that fork or
  delay.

The downside is you lose the precise "yielded `select(getAuthToken)`"
assertions. Use it for the happy path / sad path; reach for Approach 1
or 2 when you need to pin down a specific effect or branch.

### Approach 4: `redux-saga-test-plan`

For complex sagas (parallel effects, races, deeply nested forks),
[`redux-saga-test-plan`](https://github.com/jfairbank/redux-saga-test-plan)
gives you a fluent API that combines the best of "step manually" and
"run end to end".

```js
import { expectSaga } from 'redux-saga-test-plan';
import { throwError } from 'redux-saga-test-plan/providers';
import { call } from 'redux-saga/effects';

import fetchPosts from '../src/store/posts/sagas';
import * as api from '../src/api/posts';

test('fetchPosts saga happy path', () =>
  expectSaga(fetchPosts)
    .provide([[call(api.fetchPosts), [{ id: 1 }]]]) // mock the call effect
    .put({ type: 'posts/FETCH_SUCCESS', posts: [{ id: 1 }] })
    .run());

test('fetchPosts saga sad path', () =>
  expectSaga(fetchPosts)
    .provide([[call(api.fetchPosts), throwError(new Error('boom'))]])
    .put({ type: 'posts/FETCH_FAILURE', error: 'boom' })
    .run());
```

Highlights:

- `.provide([...])` mocks effects without touching the underlying API
  module. The mock matches by effect shape — i.e. the same `call(...)`
  you'd write inside the saga.
- Assertions like `.put(action)` are **partial**: you don't have to
  enumerate every dispatched action.
- `.run()` returns a promise that fulfils when the saga completes,
  which makes it trivial to use in `async` tests.
- Use `withReducer(reducer, initialState)` to also assert on the next
  state, turning a saga test into a true integration test:

```js
import postsReducer, { initialState } from '../src/store/posts/reducer';

test('fetchPosts updates state via the reducer', () =>
  expectSaga(fetchPosts)
    .withReducer(postsReducer, initialState)
    .provide([[call(api.fetchPosts), [{ id: 1 }]]])
    .hasFinalState({ ...initialState, items: [{ id: 1 }], isLoading: false })
    .run());
```

### Testing watcher sagas built by `createSagas`

`createSagas` returns an array of started watcher generators that yield
a single `takeLatest` (or `takeEvery`) effect describing what they're
watching. You can assert on that directly:

```js
import { takeLatest, takeEvery } from 'redux-saga/effects';
import { createSagas } from 'redux-box';

function* fetchPosts() { /* … */ }
function* trackEvent() { /* … */ }

const watchers = createSagas({
  'posts/FETCH_REQUEST': fetchPosts,
  'analytics/TRACK__@every': trackEvent,
});

test('builds a takeLatest watcher for posts/FETCH_REQUEST', () => {
  expect(watchers[0].next().value).toEqual(
    takeLatest('posts/FETCH_REQUEST', fetchPosts),
  );
});

test('builds a takeEvery watcher for analytics/TRACK', () => {
  expect(watchers[1].next().value).toEqual(
    takeEvery('analytics/TRACK', trackEvent),
  );
});
```

This is enough to lock in the action-to-saga wiring. The worker saga
itself (`fetchPosts`) is tested separately using one of the four
approaches above.

### Testing custom watchers (debounce, throttle, takeLeading)

Custom watchers usually live in a `sagas` config of `createStore`, not
inside `createSagas`. Test them the same way:

```js
import { debounce, call } from 'redux-saga/effects';

import * as searchApi from '../src/api/search';

function* watchSearch() {
  yield debounce(300, 'search/QUERY_CHANGED', function* (action) {
    yield call(searchApi.search, action.query);
  });
}

test('watchSearch debounces search/QUERY_CHANGED by 300ms', () => {
  const gen = watchSearch();
  const yielded = gen.next().value;

  expect(yielded.payload.ms).toBe(300);
  expect(yielded.payload.pattern).toBe('search/QUERY_CHANGED');
});
```

For full behavioural coverage (the worker actually fires after 300ms with
the latest action), `expectSaga` from `redux-saga-test-plan` ships with
fake timers built in:

```js
import { expectSaga } from 'redux-saga-test-plan';

test('watchSearch only invokes the worker once per debounce window', () =>
  expectSaga(watchSearch)
    .provide([[call(searchApi.search, 'redux'), { results: [] }]])
    .dispatch({ type: 'search/QUERY_CHANGED', query: 're' })
    .dispatch({ type: 'search/QUERY_CHANGED', query: 'red' })
    .dispatch({ type: 'search/QUERY_CHANGED', query: 'redux' })
    .silentRun(400)               // advances fake timers by 400ms
    .then(({ effects }) => {
      const calls = effects.call || [];
      expect(calls).toHaveLength(1);
      expect(calls[0].payload.args).toEqual(['redux']);
    }));
```

### Testing concurrent effects (`all`, `race`, `fork`)

Effect creators like `all`, `race`, and `fork` return — like `call` and
`put` — plain effect descriptions. Assertions look the same as for any
other effect:

```js
import { all, call, race, take, put } from 'redux-saga/effects';

function* loadDashboard() {
  const [posts, comments] = yield all([
    call(api.fetchPosts),
    call(api.fetchComments),
  ]);
  yield put({ type: 'dashboard/LOADED', posts, comments });
}

test('loadDashboard fetches posts and comments in parallel', () => {
  const gen = loadDashboard();

  expect(gen.next().value).toEqual(
    all([call(api.fetchPosts), call(api.fetchComments)]),
  );

  expect(gen.next([[{ id: 1 }], [{ id: 2 }]]).value).toEqual(
    put({ type: 'dashboard/LOADED', posts: [{ id: 1 }], comments: [{ id: 2 }] }),
  );

  expect(gen.next().done).toBe(true);
});
```

For races, feed `gen.next()` an object whose key is the winner:

```js
function* withTimeout() {
  const { posts, timeout } = yield race({
    posts:   call(api.fetchPosts),
    timeout: call(delay, 5000),
  });

  if (timeout) yield put({ type: 'posts/TIMED_OUT' });
  else yield put({ type: 'posts/LOADED', posts });
}

test('races: posts wins', () => {
  const gen = withTimeout();
  gen.next();
  expect(gen.next({ posts: [{ id: 1 }] }).value).toEqual(
    put({ type: 'posts/LOADED', posts: [{ id: 1 }] }),
  );
});

test('races: timeout wins', () => {
  const gen = withTimeout();
  gen.next();
  expect(gen.next({ timeout: true }).value).toEqual(
    put({ type: 'posts/TIMED_OUT' }),
  );
});
```

### Testing nested generators (`yield call(otherSaga)`, `yield*`)

When one saga delegates to another, you have two options:

**Compare against the effect description.** This is simplest if the
parent uses `yield call(childSaga, ...args)`:

```js
import { call } from 'redux-saga/effects';

function* parent() {
  yield call(child, 1, 2);
}

test('parent delegates to child via call', () => {
  const gen = parent();
  expect(gen.next().value).toEqual(call(child, 1, 2));
});
```

You don't need to step through `child` here — that's covered by
`child`'s own tests.

**For `yield*` delegation,** the parent's iterator transparently runs
the child's yields. Either step through both together (verbose) or, much
simpler, switch to `runSaga` / `expectSaga` and assert on what was
dispatched. `yield*` makes the manual approach painful; let the tools do
the bookkeeping.

### Common pitfalls

- **`call(fn)` doesn't call `fn`.** It returns a description. If your
  test "fails because the API got hit", you've imported the real module
  and yielded the result instead of `call(api.x)`.
- **Don't `await` inside a saga.** A `yield call(api.x)` works; an
  `await api.x()` makes the function not a generator.
- **`gen.next(value)` injects into the previous yield, not the next.**
  The first `.next()` argument is ignored — there's no yield "above" the
  first one.
- **`gen.throw()` only catches inside a `try / catch`.** If your saga
  doesn't have one, the throw propagates and the test fails with that
  error (which is a real bug — the saga has no error handling).
- **`takeLatest` watchers don't `done`.** A watcher saga loops forever;
  for watcher tests, assert on the first yielded effect and stop.

## Integration: dispatching against a real store

Sometimes you want to verify the **whole** module — reducer, sagas, and
selectors — together. Build a real store with the module, mock only the
API layer, and dispatch actions:

```js
import { createStore } from 'redux-box';

import postsModule, {
  dispatchers,
  getPosts,
  getIsLoading,
} from '../src/store/posts';
import * as api from '../src/api/posts';

jest.mock('../src/api/posts');

test('fetching posts updates the store end-to-end', async () => {
  api.fetchPosts.mockResolvedValue([{ id: 1, title: 'Hello' }]);

  const store = createStore({ posts: postsModule });

  store.dispatch(dispatchers.fetchPosts());
  expect(getIsLoading(store.getState())).toBe(true);

  // Wait long enough for the saga's call() to resolve and
  // for the SUCCESS action to be reduced.
  await new Promise(setImmediate);

  expect(getIsLoading(store.getState())).toBe(false);
  expect(getPosts(store.getState())).toEqual([{ id: 1, title: 'Hello' }]);
});
```

This is the heaviest of the approaches and the slowest, but it's useful
as a smoke test — if the wiring is broken (a typo in the action type, a
saga that never gets registered), this test will catch it.

::: tip One store per test
Always build a fresh store inside the test (or in `beforeEach`). Sharing
a store across tests leaks state and makes failures order-dependent.
:::

## Testing connected React components

For component tests, render with a real store and a real `<Provider>`.
The component itself doesn't care that Redux Box is in play.

```jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux-box';

import counter from '../src/store/counter';
import App from '../src/App';

function renderWithStore(ui, { preloadedState } = {}) {
  const store = createStore({ counter }, { preloadedState });
  return {
    store,
    ...render(<Provider store={store}>{ui}</Provider>),
  };
}

test('clicking +1 increments the count', () => {
  renderWithStore(<App />);

  fireEvent.click(screen.getByText('+1'));

  expect(screen.getByRole('heading')).toHaveTextContent('Count: 1');
});

test('starts from preloaded state', () => {
  renderWithStore(<App />, { preloadedState: { counter: { count: 7 } } });

  expect(screen.getByRole('heading')).toHaveTextContent('Count: 7');
});
```

Building the store inside the test (as opposed to importing the app's
real store) keeps each test isolated — you start from a fresh state
every time.

## A quick checklist

Before merging a Redux Box module, make sure you have:

- A test for each **dispatcher** that asserts on the returned action object.
- A test for each **mutation** covering the happy path and any branches,
  plus one "unknown action returns the same reference" assertion.
- A test for each **selector** with at least one positive and one negative
  case, and (for `reselect` selectors) a memoization test.
- For each **saga**, either:
  - a manual `.next()` walk-through (small sagas, explicit branches), or
  - a `cloneableGenerator` test (sagas with multiple branches), or
  - a `runSaga` recording (behavioural happy/sad paths), or
  - an `expectSaga` test (parallel/race/concurrent effects, debounced
    watchers, full integration with the reducer).
- One **integration** test per module that dispatches against a real
  store and asserts on the final state.
- For **connected components**, a render-with-store test that exercises
  the user-visible behaviour, not the Redux internals.

## Further reading

- [redux-saga: testing sagas](https://redux-saga.js.org/docs/advanced/Testing.html) — the canonical guide that the manual-stepping, `cloneableGenerator`, and `runSaga` patterns above are based on.
- [`redux-saga-test-plan`](https://github.com/jfairbank/redux-saga-test-plan) — full API reference for `expectSaga`, `provide`, and the integration-test helpers.
- [`@redux-saga/testing-utils`](https://www.npmjs.com/package/@redux-saga/testing-utils) — the package that provides `cloneableGenerator`.
- [Testing Library — guiding principles](https://testing-library.com/docs/guiding-principles) — recommended reading for the React component layer.
