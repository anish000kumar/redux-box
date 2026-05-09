# A Simple Counter

A complete, runnable counter app — store + module + React component — in
under 50 lines of code.

## File structure

```text
src/
  store/
    counter.js
    index.js
  App.js
  index.js
```

## The module

```js
// src/store/counter.js
import { createModule } from 'redux-box';

const state = {
  count: 0,
};

export const dispatchers = {
  increment:   ()       => ({ type: 'counter/INCREMENT' }),
  decrement:   ()       => ({ type: 'counter/DECREMENT' }),
  incrementBy: amount   => ({ type: 'counter/INCREMENT_BY', amount }),
  reset:       ()       => ({ type: 'counter/RESET' }),
};

const mutations = {
  'counter/INCREMENT':    state => { state.count += 1; },
  'counter/DECREMENT':    state => { state.count -= 1; },
  'counter/INCREMENT_BY': (state, action) => { state.count += action.amount; },
  'counter/RESET':        state => { state.count = 0; },
};

export const getCount = state => state.counter.count;

export default createModule({ state, dispatchers, mutations });
```

Notice how the mutations look as if they were directly mutating `state`. They
aren't — Immer hands you a draft and produces an immutable result behind the
scenes.

## The store

```js
// src/store/index.js
import { createStore } from 'redux-box';
import counter from './counter';

export default createStore({
  counter,
});
```

The key (`counter`) determines where this module's state lives —
`state.counter` in this case.

## The component

```jsx
// src/App.js
import React from 'react';
import { connectStore } from 'redux-box';
import { dispatchers, getCount } from './store/counter';

function App({ count, increment, decrement, incrementBy, reset }) {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: 24 }}>
      <h1>Count: {count}</h1>

      <button onClick={decrement}>-1</button>
      <button onClick={increment}>+1</button>
      <button onClick={() => incrementBy(10)}>+10</button>
      <button onClick={reset}>reset</button>
    </div>
  );
}

export default connectStore({
  mapSelectors:    { count: getCount },
  mapDispatchers:  {
    increment:   dispatchers.increment,
    decrement:   dispatchers.decrement,
    incrementBy: dispatchers.incrementBy,
    reset:       dispatchers.reset,
  },
})(App);
```

## The entry point

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

## What you'd write without Redux Box

For comparison, the same counter in vanilla Redux:

```js
const INCREMENT    = 'counter/INCREMENT';
const DECREMENT    = 'counter/DECREMENT';
const INCREMENT_BY = 'counter/INCREMENT_BY';
const RESET        = 'counter/RESET';

export const increment   = ()     => ({ type: INCREMENT });
export const decrement   = ()     => ({ type: DECREMENT });
export const incrementBy = amount => ({ type: INCREMENT_BY, amount });
export const reset       = ()     => ({ type: RESET });

const initialState = { count: 0 };

export default function counterReducer(state = initialState, action) {
  switch (action.type) {
    case INCREMENT:    return { ...state, count: state.count + 1 };
    case DECREMENT:    return { ...state, count: state.count - 1 };
    case INCREMENT_BY: return { ...state, count: state.count + action.amount };
    case RESET:        return { ...state, count: 0 };
    default:           return state;
  }
}
```

…then `combineReducers`, then `createStore`, then `applyMiddleware` once you
need any — boilerplate which Redux Box collapses into a single
`createStore({ counter })` call.

## Next: async work

Counters are easy because there are no side effects. For a feature that talks
to a real API and tracks request state, see [Async Data
Fetching](/advanced-example.html).
