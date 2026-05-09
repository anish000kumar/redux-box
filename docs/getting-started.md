# Introduction

Redux Box is a thin, opinionated container around [Redux](https://redux.js.org/)
and [Redux-Saga](https://redux-saga.js.org/) that organizes your application
state as a collection of independent **modules**.

It's still plain Redux underneath — your devtools, middleware, and the rest of
the ecosystem all keep working — but you write **far less boilerplate** to get
there.

## Why Redux Box?

| Without Redux Box                                              | With Redux Box                                  |
| -------------------------------------------------------------- | ----------------------------------------------- |
| Action types, action creators, and reducers in separate files. | One module file per feature.                    |
| Manual immutable updates with spread/`Object.assign`.          | Mutate the draft state — Immer makes it immutable. |
| Wire up `redux-saga` middleware and root saga by hand.         | Sagas declared in the module are wired for you. |
| Boilerplate `combineReducers` calls.                           | `createStore({ moduleA, moduleB })`.            |

## Installation

::: code-tabs#shell
@tab npm

```bash
npm install redux-box
```

@tab yarn

```bash
yarn add redux-box
```

@tab pnpm

```bash
pnpm add redux-box
```
:::

Redux Box has the following peer dependencies, install them if your project
doesn't already have them:

```bash
npm install react react-redux redux redux-saga immer reselect
```

## Your first module

A module is a plain object with up to five segments — `state`, `mutations`,
`dispatchers`, `sagas`, and `selectors`. You only need to declare the segments
you actually use.

Here's a minimal counter:

```js
// src/store/counter.js
import { createModule } from 'redux-box';

const state = { count: 0 };

export const dispatchers = {
  increment: () => ({ type: 'counter/INCREMENT' }),
  incrementBy: amount => ({ type: 'counter/INCREMENT_BY', amount }),
};

const mutations = {
  'counter/INCREMENT': state => {
    state.count += 1;
  },
  'counter/INCREMENT_BY': (state, action) => {
    state.count += action.amount;
  },
};

export default createModule({ state, mutations });
```

Things to note:

- The reducer body **looks mutable** (`state.count += 1`). Under the hood, Redux
  Box runs each mutation through [Immer](https://github.com/immerjs/immer)'s
  `produce`, so you get true immutability without the `...spread` gymnastics.
- `dispatchers` is just a bag of action creators — anything that returns
  `{ type, ...payload }`.
- The action `type` strings are entirely up to you. Prefixing them with the
  module name (`counter/...`) is a useful convention but not required.

## Wiring up the store

```js
// src/store/index.js
import { createStore } from 'redux-box';
import counter from './counter';

export default createStore({
  counter,
});
```

The key you give a module here (`counter`) becomes its slice of the global
state — i.e. `state.counter.count`.

## Plugging it into React

Wrap your tree in `react-redux`'s `Provider`:

```jsx
// src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import store from './store';
import App from './App';

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>,
);
```

Then connect a component using Redux Box's `connectStore`:

```jsx
// src/App.js
import React from 'react';
import { connectStore } from 'redux-box';
import { dispatchers } from './store/counter';

function App({ count, increment }) {
  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={increment}>+1</button>
    </div>
  );
}

export default connectStore({
  mapState: state => ({ count: state.counter.count }),
  mapDispatchers: { increment: dispatchers.increment },
})(App);
```

That's the entire flow:

1. Component dispatches `increment()`.
2. The action `counter/INCREMENT` reaches the `counter` module's reducer.
3. The matching mutation runs against an Immer draft of the slice.
4. React-Redux re-renders with the new `count`.

## Where to next?

- [**Core Concepts**](/core-concepts.html) — a deeper look at modules, Immer
  semantics, dispatchers, sagas, and selectors.
- [**Simple Example**](/simple-example.html) — the full counter app, end to end.
- [**Async Data Fetching**](/advanced-example.html) — request/success/failure
  flows with sagas.
- [**Recipes**](/recipes.html) — devtools, preloaded state, custom reducers,
  middleware, and more.
- [**Testing**](/testing-practises.html) — strategies for testing modules.
