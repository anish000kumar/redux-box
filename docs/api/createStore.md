---
title: createStore
---

# createStore

## Functions

<dl>
<dt><a href="#createStore">createStore(config)</a> ⇒ <code>Object</code></dt>
<dd><p>Creates redux store</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#Module">Module</a> : <code>Object</code></dt>
<dd><p>Object representing module</p>
</dd>
</dl>

<a name="createStore"></a>

## createStore(config) ⇒ <code>Object</code>
Creates redux store

**Kind**: global function  
**Returns**: <code>Object</code> - store  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | Contains configuration for store |
| config.modules | <code>Object.&lt;String, Module&gt;</code> | Object containing all modules to be attached to store |
| config.middlewares | <code>Array.&lt;function()&gt;</code> | Array of middlewares to be used in store |
| [config.reducers] | <code>Object.&lt;String, function()&gt;</code> | (Optional) Object containing reducers to be used in store |
| config.sagas | <code>Array.&lt;Generator&gt;</code> | Array of watcher sagas to be used in store |
| [config.preloadedState] | <code>Object</code> | (Optional) Preloaded state for store |
| [config.decorateReducer] | <code>function</code> | (Optional) decorator function for reducer formed by redux-box, has formed reducer as first argument |

**Example**  
```js
import { createStore } from "redux-box";
import userModule from "./modules/user";
import marketplaceModule from "./modules/marketplace";

createStore([userModule, marketplaceModule],{
 enableDevTools() => true
})
```
<a name="Module"></a>

## Module : <code>Object</code>
Object representing module

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [state] | <code>Object</code> | Initial state for the module |
| [dispatchers] | <code>Object.&lt;String, function()&gt;</code> | Action dispatchers for the module |
| [sagas] | <code>Object.&lt;String, Generator&gt;</code> | Sagas for the module |
| [mutations] | <code>Object.&lt;String, function()&gt;</code> | Mutations for the module |
| [selectors] | <code>Object.&lt;String, function()&gt;</code> | Selector for the module |

