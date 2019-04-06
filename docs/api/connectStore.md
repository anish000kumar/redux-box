---
title: connectStore
---

# connectStore

<a name="connectStore"></a>

## connectStore(connectContext) ⇒ <code>function</code>
Connects the state, selectors and dispatchers to components.

**Kind**: global function  
**Returns**: <code>function</code> - - return the output of connect() from react-redux  

| Param | Type | Description |
| --- | --- | --- |
| connectContext | <code>Object</code> | context object for connecting store to component |
| connectContext.mapState | <code>function</code> | maps store-state to component-props |
| connectContext.mapDispatchers | <code>Object</code> \| <code>function</code> | maps module-dispatchers to component-props |
| connectContext.mapSelectors | <code>Object</code> | maps module-selectors to component-props |
| connectContext.mergeProps | <code>function</code> | merges returned values from mapState, mapSelectors and mapDispatchers to return final component-props |
| connectContext.options | <code>Object</code> | optional object passed to react-redux's connect function as fourth argument |

**Example**  
```js
import { connectStore } from "redux-box";
import { selectors, dispatchers } from "./store/userModule";

connectStore({
 mapState: state => ({ name: state.user.name }),
 mapSelectors: { userProfile : selectors.getProfile },
 mapDispatchers: { getProfile: dispatchers.fetchProfile }
})
```
