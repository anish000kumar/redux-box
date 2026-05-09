---
title: createModule
---

# createModule

## Functions

<dl>
<dt><a href="#generateId">generateId()</a> ⇒ <code>String</code></dt>
<dd><p>Generates an RFC4122-style v4 UUID. Used internally by <a href="#createModule">createModule</a>
to give every module a stable, unique id so it can be looked up in the
module registry regardless of the key it was mounted under in the store.</p>
</dd>
<dt><a href="#createModule">createModule(moduleObj)</a> ⇒ <code>Object</code></dt>
<dd><p>Wraps a plain module definition (state, mutations, sagas, selectors,
dispatchers) into a redux-box module. The returned object has a unique
<code>id</code> and a few helpers (<code>getName</code>, <code>getSelector</code>, <code>select</code>) that let
selectors and components reference the module without hard-coding the
key it was mounted under in the store.</p>
</dd>
</dl>

<a name="generateId"></a>

## generateId() ⇒ <code>String</code>
Generates an RFC4122-style v4 UUID. Used internally by [createModule](#createModule)
to give every module a stable, unique id so it can be looked up in the
module registry regardless of the key it was mounted under in the store.

**Kind**: global function
**Returns**: <code>String</code> - A new UUID, e.g. `"3b1f0c64-0b2e-4a3f-8e65-7b6a8b4d9f10"`.
<a name="createModule"></a>

## createModule(moduleObj) ⇒ <code>Object</code>
Wraps a plain module definition (state, mutations, sagas, selectors,
dispatchers) into a redux-box module. The returned object has a unique
`id` and a few helpers (`getName`, `getSelector`, `select`) that let
selectors and components reference the module without hard-coding the
key it was mounted under in the store.

**Kind**: global function
**Returns**: <code>Object</code> - The decorated module. In addition to the original keys it exposes:
  - `id` {String} - unique id assigned to this module.
  - `getName()` {Function} - returns the key the module was registered under in the store.
  - `getSelector()` {Function} - returns a `(state) => moduleState` selector.
  - `select(fn)` {Function} - builds a memoized reselect selector over the module state.

| Param | Type | Description |
| --- | --- | --- |
| moduleObj | <code>Module</code> | Plain module definition (see [Module](Module)). |

**Example**
```js
// modules/user/index.js
import { createModule } from 'redux-box';
import * as mutations from './mutations';
import * as sagas from './sagas';
import * as selectors from './selectors';
import * as dispatchers from './dispatchers';

export default createModule({
  name: 'user',
  state: { id: null, name: '' },
  mutations,
  sagas,
  selectors,
  dispatchers,
});
```
**Example**
```js
// Using the `select` helper to build a memoized selector
// that is independent of the key the module was mounted under.
const getUserName = userModule.select(user => user.name);
```
