---
title: get
---

# get

<a name="get"></a>

## get(object, keys, [defaultVal]) ⇒ <code>\*</code>
Safely reads a deeply nested value from an object using a dot-separated path
(or an array of keys). If any segment of the path is missing, `defaultVal`
is returned instead of throwing.

**Kind**: global function  
**Returns**: <code>\*</code> - The resolved value, or `defaultVal` if the path could not be resolved.  

| Param | Type | Description |
| --- | --- | --- |
| object | <code>Object</code> | Source object to read from. Non-objects return `defaultVal`. |
| keys | <code>String</code> \| <code>Array.&lt;String&gt;</code> | Dot-separated path (e.g. `"a.b.c"`) or an array of keys. |
| [defaultVal] | <code>\*</code> | Value returned when the path resolves to `undefined`. |

**Example**  
```js
import get from 'redux-box/dist/utils/get';

const state = { user: { profile: { name: 'Anish' } } };

get(state, 'user.profile.name');           // => 'Anish'
get(state, ['user', 'profile', 'name']);   // => 'Anish'
get(state, 'user.profile.age', 0);         // => 0 (missing key, default returned)
get(state, 'user.address.city', null);     // => null
```
