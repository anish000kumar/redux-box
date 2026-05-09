# Testing

Redux Box modules are easy to test because each segment is a plain function
or generator: you can exercise reducers, dispatchers, sagas, and selectors
in complete isolation, with no rendering or store setup required.

This page assumes [Jest](https://jestjs.io/) but the patterns translate
directly to Vitest, Mocha, or anything else.

## Testing dispatchers

Dispatchers are pure functions returning plain objects — the simplest thing
to test:

```js
import { dispatchers } from '../src/store/counter';

test('incrementBy returns the right action', () => {
  expect(dispatchers.incrementBy(5)).toEqual({
    type: 'counter/INCREMENT_BY',
    amount: 5,
  });
});
```

## Testing mutations (the reducer)

Redux Box turns the `mutations` object into a real reducer using Immer. You
can build the same reducer in tests by calling Immer's `produce` directly,
or by exporting a tiny helper from your module file:

```js
// src/store/counter.js
import { produce } from 'immer';
import { createModule } from 'redux-box';

export const initialState = { count: 0 };

export const mutations = {
  'counter/INCREMENT': state => { state.count += 1; },
};

export const reducer = (state = initialState, action) =>
  produce(state, draft => {
    const m = mutations[action.type];
    if (m) m(draft, action);
  });

export default createModule({ state: initialState, mutations });
```

Now the reducer is straightforward to test:

```js
import { reducer, initialState } from '../src/store/counter';

test('INCREMENT bumps count', () => {
  const next = reducer(initialState, { type: 'counter/INCREMENT' });

  expect(next.count).toBe(1);
  expect(initialState.count).toBe(0); // immutability check
});

test('unknown action returns the same reference', () => {
  const next = reducer(initialState, { type: 'unknown' });

  expect(next).toBe(initialState);
});
```

::: tip Why the same reference?
Immer's `produce` only allocates a new object when the draft was actually
modified. For unrelated actions, the previous state is returned by reference
— which is exactly what `react-redux`'s `===` check needs to skip a render.
Asserting on this guards against accidental "I returned a new object every
time" bugs.
:::

## Testing selectors

Selectors are just functions of state — feed them a fixture and assert the
output:

```js
import { getItemCount, getPublishedItems } from '../src/store/posts';

const state = {
  posts: {
    items: [
      { id: 1, published: true },
      { id: 2, published: false },
    ],
  },
};

test('getItemCount counts all items', () => {
  expect(getItemCount(state)).toBe(2);
});

test('getPublishedItems filters to published posts', () => {
  expect(getPublishedItems(state)).toEqual([{ id: 1, published: true }]);
});
```

For [reselect](https://github.com/reduxjs/reselect)-based selectors, remember
to call `selector.recomputations()` and `selector.resetRecomputations()` if
you want to assert memoization.

## Testing sagas

The lightweight approach is to **step a worker saga manually** by calling
`.next()`. This keeps tests dependency-free and explicit about what each
yield does.

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

  expect(gen.next().value).toEqual(call(api.fetchPosts));

  const fakePosts = [{ id: 1, title: 'Hi' }];
  expect(gen.next(fakePosts).value).toEqual(
    put({ type: 'posts/FETCH_SUCCESS', posts: fakePosts }),
  );
  expect(gen.next().done).toBe(true);
});

test('fetchPosts dispatches FAILURE when the API throws', () => {
  const gen = fetchPosts();

  gen.next(); // call(api.fetchPosts)

  const err = new Error('boom');
  expect(gen.throw(err).value).toEqual(
    put({ type: 'posts/FETCH_FAILURE', error: 'boom' }),
  );
  expect(gen.next().done).toBe(true);
});
```

For more involved sagas (parallel effects, nested generators, race conditions),
[`redux-saga-test-plan`](https://github.com/jfairbank/redux-saga-test-plan)
gives you a fluent integration-test API:

```js
import { expectSaga } from 'redux-saga-test-plan';
import { call } from 'redux-saga/effects';

import fetchPosts from '../src/store/posts/sagas';
import * as api from '../src/api/posts';

test('fetchPosts saga happy path', () =>
  expectSaga(fetchPosts)
    .provide([[call(api.fetchPosts), [{ id: 1 }]]])
    .put({ type: 'posts/FETCH_SUCCESS', posts: [{ id: 1 }] })
    .run());
```

## Integration: dispatching against a real store

Sometimes you want to verify the **whole** module — reducer, sagas, and
selectors — together. Build a real store with the module, mock only the API
layer, and dispatch actions:

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

  // Wait one microtask tick so the saga's call() resolves.
  await Promise.resolve();
  await Promise.resolve();

  expect(getIsLoading(store.getState())).toBe(false);
  expect(getPosts(store.getState())).toEqual([{ id: 1, title: 'Hello' }]);
});
```

This is the heaviest of the three approaches and the slowest, but it's
useful as a smoke test — if the wiring is broken, this test will catch it.

## Testing connected React components

For component tests, render with a real store and a real `<Provider>`. The
component itself doesn't care that Redux Box is in play.

```jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux-box';

import counter from '../src/store/counter';
import App from '../src/App';

function renderWithStore(ui) {
  const store = createStore({ counter });
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
```

Building the store inside the test (as opposed to importing the app's real
store) keeps each test isolated — you start from a fresh state every time.

## A quick checklist

- ✅ Test **dispatchers** by asserting the returned action object.
- ✅ Test **mutations** by exporting a small reducer wrapper or by calling
  `produce` directly.
- ✅ Test **selectors** with state fixtures.
- ✅ Test **sagas** with manual `.next()` stepping or `redux-saga-test-plan`.
- ✅ For end-to-end confidence, dispatch against a real `createStore` with
  the API layer mocked.
