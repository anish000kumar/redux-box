<p align="center"><a href="#" target="_blank">
	<img style="max-width:700px" src="https://image.ibb.co/e4Nce6/redux_box.png" alt="redux_box" border="0">
</a></p>

# Redux Box
Setting up and organizing a redux store in your react/ react-native projects can be a tedious and daunting task. Redux-Box aims at extracting the complexity in setting up redux with redux-saga, without loosing the flexibilty or without introducing new bizzare terms.

## Table of contents:
* [What's it for](#whats-it-for)
* [Installation](#installation)
* [The Basics](#the-basics)
* [Usage](#usage)
  * [1. Create a module](#step-1-create-a-module)
  * [2. Register the module in redux-store](#step-2-register-the-module-in-redux-store)
  * [3. Use the module in component](#step-3-use-the-module-in-component)
    * [Through `@connectStore` decorator](#through-decorator)
    * [Or through `render props`](#or-through-render-props)
 * [Live Examples](#live-examples)
* [FAQs](#faqs)



## What's it for:

1 .**Clean, expressive and minimal reducers:** 
If you prefer keeping your code expressive, you will feel right at home with redux-box. Have a look at a simple reducer written with and without redux-box:
<p align="center"><a href="https://image.ibb.co/dwP1UR/comparison.jpg" target="_blank">
	<img style="max-width:100%" src="https://image.ibb.co/dwP1UR/comparison.jpg" alt="redux_box" border="0">
</a></p>

If you are concerned about the state getting mutated directly in the snippet above, then you need not be. Because the `state` being passed to a mutation is **NOT** the actual `state object`  of application, instead it's a [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) of the state. Redux-box relies on wonderful [immer](https://github.com/mweststrate/immer) library to achieve the expressiveness you see above.

2. **Organise your giant state into modules**
3. **Setup redux+redux-saga for our react/react-native app in a trice**
4. **Simplified Sagas**
5. **Just import and use store**:
You wouldn't need to write a dedicated HOC to interact with your store. If you need to interact with a particular store-module, you can simply import it and use it. As simple as that! Redux box offers two ways of using a module in your component : using `@connectStore` decorator or using `render props`. (refer to the usage section for better reference)


## Installation
Run this command in your terminal/cmd to install the package:
```
npm install --save redux-box
```

## The Basics

Redux box emphasizes on dividing the whole application into multiple modules. Each of these modules manages it's state seperately, with the help of 4 segments:

1. state 
(It specifies the initial state of the module)

2. mutations 
(It specifies the function to be run when a specific action is dispatched, it's same as reducer but clutter-free)

3. actions
(it contains the actionCreators for your store. Each method of this object must return an action object  )

4. sagas 
(this is where you write all your sagas / async operations)


## Usage


### step 1: create a module
Make sure you specify a unique name for each module ('user' in this example)
```javascript
// store/user.js
import {createSagas, createContainer} from 'redux-box'
import {call} from 'redux-saga/effects'

const state = {
  name  : 'John',
  email : 'john@doe.com',
}

const actions = {
  setName  : (name)  => ({ type : 'SET_NAME',  name  }),
  setEmail : (email) => ({ type : 'SET_EMAIL', email }),
}

const mutations = {
  SET_NAME  : (state, action) => state.name  = action.name,
  SET_EMAIL : (state, action) => state.email = action.email
}

const sagas = createSagas({
  SET_EMAIL : function* (action){
      const response = yield call(api.updateEmail, action.email)
  }
})

export const module = {
  name : 'user',
  state, 
  actions, 
  mutations, 
  sagas
}

//OPTIONAL: if you want to access this store using render props:
export default createContainer(module)
```

### step 2 : register the module in redux store

```javascript
import {createStore} from 'redux-box'
import {module as userModule} from './user'
import {module as postModule} from './post'

export default createStore([ userModule, postModule])

```
OPTIONAL: if you need to create store with some reducers and middlewares, the signature of createStore method from redux-box goes like this:(if you have already included a module in modules array, you need **NOT** to register it's sagas or reducers manually by including in config object)

```javascript
import {moduleToReducer} from 'redux-box/helpers'

createStore(modules : Array, config: Object)

//example config object
config = {
  middlewares : [],
  
  // sagas to be manually registered
  sagas : [userModule.sagas, testModule.sagas], 
  
  // reducers to be manually registered
  reducers: {
    user : moduleToReducer(user)
  } 
  decorateReducer: (reducer) => {
    //do something
    return newReducer
  }
}

```

After this you would need to wrap your root component around the Provider  tag like so :

```javascript
import React from 'react'
import {Provider} from 'react-redux'
import store from './store'
import RootComponent from './components/RootComponent'

class App extends React.component{
  render(){
    return(
      <Provider store={store}>
        <RootComponent/>
      </Provider>
    )
  }
}

export default App
```
### step 3: Use the module in component

#### through decorator
```javascript
import React, { Component } from 'react'
import {module as userModule} from 'store/user'
import {connectStore} from 'redux-box'

@connectStore({
    user : userModule //  AppComponent receives 'user' as a prop
})
export default class AppComponent extends Component {

  componentDidMount(){
    console.log(this.props.user)
    /*
        {
            name : 'John',
            email : 'john@doe.com',
            setName : fn(arg),
            setEmail : fn(arg)
        }
    */
  }

  render() {
    const {user} = this.props
    return (
      <div>
        <h1>{user.name}</h1>
        <h2>{user.email}</h2>
      </div>
    )
  }
}

```
#### or through render props

```javascript
import React, {Component} from 'react'
import UserModule from 'store/user'

export default class AppComponent extends Component{
 render(){
  return(
   <div>
    <UserModule>
      {(user)=>(
        <p> {user.name} </p>
	<p> {user.email} </p>
      )}
    </UserModule>
   </div>
  )
 }
}
 ```
## Live Examples
Here are some examples to let you play around with redux-box
1. Basic example - https://stackblitz.com/edit/react-3c8vsn?file=Hello.js
2. Example showing redux-saga usage: - https://stackblitz.com/edit/react-qmedt4?file=Hello.js
3. Example usage with redux-form: https://stackblitz.com/edit/react-w4dqth?file=store%2Findex.js
4. Example usage with redux-persist : https://stackblitz.com/edit/react-pezrbb?file=store%2Findex.js

## FAQs

1.  **Can I use all the features of redux-box, with `createStore` from redux instead?**

Yes, you can! Here's the script showing how you can use `createStore` from redux, to setup your modules (with reducers, sagas and middlewares):
(v1.3.9 onwards)
```javascript
import {applyMiddleware,combineReducers, compose, createStore} from 'redux';
import createSagaMiddleware from "redux-saga";
import {all} from 'redux-saga/effects';
import {moduleToReducer} from 'redux-box'
import {module as homeModule} from './home'
import {module as userModule} from './user'

//hook up your module reducers
const combinedReducer = combineReducers({
  home : moduleToReducer(homeModule),
  user : moduleToReducer(userModule)
})

// hook up your module sagas
const sagas = [
...homeModule.sagas, 
...userModule.sagas
]

// hook up your middlewares here
const sagaMiddleware = createSagaMiddleware();
const middlewares = [sagaMiddleware];


//what follows below if traditional, manual approach of setting up store
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
let enhancer = composeEnhancers(applyMiddleware(...middlewares))

function *rootSaga(){
  yield all(sagas)
}

const store = createStore( combinedReducer, enhancer );
sagaMiddleware.run(rootSaga);
export default store;
```
