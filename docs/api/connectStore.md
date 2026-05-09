---
title: connectStore
---

# connectStore

<a name="connectStore"></a>

## connectStore(connectParams) ⇒ <code>function</code>
Connects state, eager selectors, lazy (parameterized) selectors and
dispatchers to a component.

Two flavours of selectors are supported:

- **`mapSelectors`** — eager selectors of the form `(state, ownProps) => value`.
  They are evaluated on every store update and their result is passed to the
  component as a prop. Use these for values the component renders.

- **`mapLazySelectors`** — parameterized selectors of the form
  `(state, ...args) => value`. `connectStore` wraps each one into a
  `(...args) => value` callable that always reads the latest state, and
  exposes that callable as a prop. The function reference is **stable** across
  renders, so adding a lazy selector does not, by itself, cause the connected
  component to re-render on unrelated dispatches. If you need the component
  to re-render when the underlying data changes, expose a regular eager
  selector (or a `mapState` slice) that subscribes to it.

**Kind**: global function  
**Returns**: <code>function</code> - return the output of connect() from react-redux  

| Param | Type | Description |
| --- | --- | --- |
| connectParams | <code>Object</code> | context object for connecting store to component |
| connectParams.mapState | <code>function</code> | maps store-state to component-props |
| connectParams.mapDispatchers | <code>Object</code> \| <code>function</code> | maps module-dispatchers to component-props |
| connectParams.mapSelectors | <code>Object</code> | maps eager module-selectors to component-props |
| connectParams.mapLazySelectors | <code>Object</code> | maps parameterized module-selectors to callable component-props with stable references |
| connectParams.mergeProps | <code>function</code> | merges returned values from mapState, mapSelectors, mapLazySelectors and mapDispatchers to return final component-props |
| connectParams.options | <code>Object</code> | optional object passed to react-redux's connect function as fourth argument |

**Example**  
```js
import { connectStore } from "redux-box";
import { selectors, dispatchers } from "./store/userModule";

connectStore({
  mapState: state => ({ name: state.user.name }),
  mapSelectors: { userProfile: selectors.getProfile },
  mapLazySelectors: { getUserById: selectors.selectUserById },
  mapDispatchers: { fetchProfile: dispatchers.fetchProfile },
})
```

In the connected component, `userProfile` is a value, while `getUserById` is
a callable: `props.getUserById(42)` returns the user with id `42` from the
latest state.
