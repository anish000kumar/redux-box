---
title: connectStore
---

# connectStore

<a name="connectStore"></a>

## connectStore(connectParams) ⇒ <code>function</code>
Connects the state, selectors and dispatchers to components.

**Kind**: global function  
**Returns**: <code>function</code> - - return the output of connect() from react-redux  

| Param | Type | Description |
| --- | --- | --- |
| connectParams | <code>Object</code> | context object for connecting store to component |
| connectParams.mapState | <code>function</code> | maps store-state to component-props |
| connectParams.mapDispatchers | <code>Object</code> \| <code>function</code> | maps module-dispatchers to component-props |
| connectParams.mapSelectors | <code>Object</code> | maps module-selectors to component-props |
| connectParams.mergeProps | <code>function</code> | merges returned values from mapState, mapSelectors and mapDispatchers to return final component-props |
| connectParams.options | <code>Object</code> | optional object passed to react-redux's connect function as fourth argument |

**Example**  
```js
import { connectStore } from "redux-box";
import { selectors, dispatchers } from "./store/userModule";

connectStore({
 mapState: state => ({ name: state.user.name }),
 mapSelectors: { userProfile : getProfile },
 mapDispatchers: { getProfile: fetchProfile }
})
```
