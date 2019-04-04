---
title: createSagas
---

# createSagas

## Functions

<dl>
<dt><a href="#createSagas">createSagas(sagasObject)</a> ⇒ <code>Array.&lt;Generator&gt;</code></dt>
<dd><p>Function to create watcher and worker sagas for redux store</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#SagaObject">SagaObject</a> : <code>Object</code></dt>
<dd><p>Object containing watcher and worker sagas</p>
</dd>
</dl>

<a name="createSagas"></a>

## createSagas(sagasObject) ⇒ <code>Array.&lt;Generator&gt;</code>
Function to create watcher and worker sagas for redux store

**Kind**: global function  
**Returns**: <code>Array.&lt;Generator&gt;</code> - array of watcher sagas  

| Param | Type | Description |
| --- | --- | --- |
| sagasObject | <code>Object.&lt;ActionName, (Generator\|SagaObject)&gt;</code> | Object containing module's sagas. The key is name of  the action that triggers the saga and value is generator or SagaObject |

**Example**  
```js
createSagas({
 FETCH_USERS: function* fetchUser(){
   const users = yield call(api.fetchUsers);
  }
})
```
<a name="SagaObject"></a>

## SagaObject : <code>Object</code>
Object containing watcher and worker sagas

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [watcher] | <code>Generator</code> | watcher saga |
| [worker] | <code>Generator</code> | worker saga |
| [watchFor] | <code>&#x27;every&#x27;</code> \| <code>&#x27;latest&#x27;</code> | Accepts |

