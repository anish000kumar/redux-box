---
title: moduleRegistry
---

# moduleRegistry

<a name="ModuleRegistry"></a>

## ModuleRegistry
**Kind**: global class  

* [ModuleRegistry](#ModuleRegistry)
    * [new ModuleRegistry()](#new_ModuleRegistry_new)
    * [.register(name, module)](#ModuleRegistry+register) ⇒ <code>void</code>
    * [.getName(id)](#ModuleRegistry+getName) ⇒ <code>String</code> \| <code>null</code>

<a name="new_ModuleRegistry_new"></a>

### new ModuleRegistry()
Internal singleton that keeps track of every module attached to the redux
store and the key it was mounted under. The registry is populated by
[createStore](createStore) when it iterates the `modules` map and is consumed by
[createModule](createModule) helpers (`getName`, `getSelector`, `select`) so that
modules don't have to hard-code their slice key.

You generally don't need to touch the registry yourself - it is exported
mostly for advanced use cases (testing, hot module replacement, debugging).

**Example**  
```js
import moduleRegistry from 'redux-box/dist/moduleRegistry';

// After createStore() has run, look up the slice key for a module id:
const sliceKey = moduleRegistry.getName(userModule.id);
```
<a name="ModuleRegistry+register"></a>

### moduleRegistry.register(name, module) ⇒ <code>void</code>
Registers a module under the key it is mounted with in the store.
Called automatically by [createStore](createStore) for every entry of the
`modules` argument.

**Kind**: instance method of [<code>ModuleRegistry</code>](#ModuleRegistry)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | The key the module is mounted under in the store. |
| module | <code>Object</code> | The module object returned by [createModule](createModule). Must have an `id`. |

<a name="ModuleRegistry+getName"></a>

### moduleRegistry.getName(id) ⇒ <code>String</code> \| <code>null</code>
Returns the store key a module was mounted under, given its id.

**Kind**: instance method of [<code>ModuleRegistry</code>](#ModuleRegistry)  
**Returns**: <code>String</code> \| <code>null</code> - The mounted slice key, or `null` if the module is not registered.  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> | The unique id assigned to the module by [createModule](createModule). |

