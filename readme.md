<p align="center"><a href="#" target="_blank">
	<img style="max-width:700px" src="https://image.ibb.co/e4Nce6/redux_box.png" alt="redux_box" border="0">
</a></p>

# Redux Box

Setting up and organizing a redux store in your react/react-native projects can be a tedious and daunting task. Redux-Box aims at abstracting away the complexity in using redux with redux-saga, while letting you manage application state in modular fashion, without losing the flexibility or without introducing new bizarre terms.

<p align="center"><a href="https://www.youtube.com/watch?v=z3cp6xs2HmE" target="_blank">
	<img style="max-width:700px" src="https://image.ibb.co/fToGkx/redux_box_1.png" alt="redux_box" border="0">
</a></p>
<p align="center">Illustration by <a href="https://dribbble.com/Vraj247">Vikas</a></p>

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
* [Upcoming Features](#upcoming-features)
* [FAQs](#faqs)



## What's it for:

1. **Clean, expressive and minimal reducers:**
   If you prefer keeping your code expressive, you will feel right at home with redux-box. Have a look at a simple reducer written with and without redux-box:

<p align="center"><a href="https://image.ibb.co/dwP1UR/comparison.jpg" target="_blank">
	<img style="max-width:100%" src="https://image.ibb.co/dwP1UR/comparison.jpg" alt="redux_box" border="0">
</a></p>

If you are concerned about the state getting mutated directly in the snippet above, then you need not be. Because the `state` being passed to a mutation is **NOT** the actual `state object` of application, instead it's a [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) of the state. Redux-box relies on wonderful [immer](https://github.com/mweststrate/immer) library to achieve the expressiveness you see above.

2. **Organise your giant state into modules**
3. **Setup redux+redux-saga for our react/react-native app in a trice**
4. **Simplified Sagas**
5. **Just import and use store**:
   You wouldn't need to write a dedicated HOC to interact with your store. If you need to interact with a particular store-module, you can simply import it and use it. As simple as that! Redux box offers two ways of using a module in your component : using `@connectStore` decorator or using `render props`. (refer to the usage section for better reference)

## Installation

```
npm install --save redux-box 
```

OR

```
yarn add redux-box 
```


#### Note for React Native:
To support the latest decorator and generator syntax, you would want to use the `.babelrc` file as below:
```
{
  "presets": [
    "babel-preset-react-native-stage-0/decorator-support"
  ],
  "env": {
    "development": {
      "plugins": [
        "transform-react-jsx-source",
        "transform-es2015-typeof-symbol"
      ]
    },
    "production": {
      "plugins": ["transform-remove-console"]
    }
  }
}
```



## The Basics

Redux box emphasizes on dividing the whole application into multiple modules. Each of these modules manages it's state seperately, with the help of 5 segments (You can skip the segments you don't need in your project):

1. state
   (It specifies the initial state of the module)

2. mutations
   (It specifies the function to be run when a specific action is dispatched, it's same as reducer but clutter-free)

3. actions
   (it contains the actionCreators for your store. Each method of this object must return an action object )

4. sagas
   (this is where you write all your sagas / async operations)

5. selectors
   ( selectors can be thought of as getters or computed properties from your state)

## Usage

### step 1: create a module

Make sure you specify a unique name for each module ('user' in this example)

```javascript
// store/user.js
import { createSagas, createContainer } from "redux-box";
import { call } from "redux-saga/effects";

const state = {
  name: "John",
  email: "john@doe.com",
  todos: [{ name: "First", type: 1 }, { name: "Second", type: 0 }]
};

const actions = {
  setName: name => ({ type: "SET_NAME", name }),
  setEmail: email => ({ type: "SET_EMAIL", email })
};

const mutations = {
  SET_NAME: (state, action) => (state.name = action.name),
  SET_EMAIL: (state, action) => (state.email = action.email)
};

const sagas = createSagas({
  SET_EMAIL: function*(action) {
    const response = yield call(api.updateEmail, action.email);
  }
});

//selectors
const getTodos = (state) => state.todos

const getCompletedTodos = createSelector( getTodos, (todos) => {
    return  todos.filter(todo => todo.type==1)
})

// include the ones you would like to access in your components here
const selectors = {
    getTodos,
    getCompletedTodos
};

export const module = {
  name: "user",
  state,
  actions,
  mutations,
  sagas,
  selectors
};

//OPTIONAL: if you want to access this module using render props in your components:
export default createContainer(module);
```

NOTE: There also exists an optional shorthand to create actions rapidly, like so:

```javascript
import {createActions, using} from 'redux-box'

const actions= createActions({
  setName: using('name'),
  setEmail: using('email')
})
```
The actionCreators generated by this code are same as the ones generated by the above code.

### step 2 : register the module in redux store

```javascript
import { createStore } from "redux-box";
import { module as userModule } from "./user";
import { module as postModule } from "./post";

export default createStore([userModule, postModule]);
```

OPTIONAL: if you need to create store with some reducers and middlewares, the signature of createStore method from redux-box goes like this:(if you have already included a module in modules array, you need **NOT** to register it's sagas or reducers manually by including in config object)

```javascript
import { moduleToReducer } from "redux-box";

createStore((modules: Array), (config: Object));

//example config object
config = {

  //define redux middlewares
  middlewares: [],
  
   //define the default state for your store
  preloadedState: {},

  // sagas to be manually registered
  sagas: [userModule.sagas, testModule.sagas],

  // reducers to be manually registered
  reducers: {
    user: moduleToReducer(user)
  },
  decorateReducer: reducer => {
    //do something
    return newReducer;
  },
  
  //overrite the compose function
  composeRedux: (composer) => {
    // do something
    // return modified compose function
  },
  
  // Dynamically decide when to enable or disable dev-tools 
  enableDevTools: () => true
};
```

After this you would need to wrap your root component around the Provider tag like so :

```javascript
import React from "react";
import { Provider } from "react-redux";
import store from "./store";
import RootComponent from "./components/RootComponent";

class App extends React.component {
  render() {
    return (
      <Provider store={store}>
        <RootComponent />
      </Provider>
    );
  }
}

export default App;
```

### step 3: Use the module in component

#### through decorator

```javascript
import React, { Component } from "react";
import { module as userModule } from "store/user";
import { connectStore } from "redux-box";

@connectStore({
  user: userModule //  AppComponent receives 'user' as a prop
})
export default class AppComponent extends Component {
  componentDidMount() {
    console.log(this.props.user);
    /*
	{
	    name : 'John',
	    email : 'john@doe.com',
	    getTodos: [{ name: "First", type: 1 }, { name: "Second", type: 0 }],
	    getCompletedTodos: [{ name: "First", type: 1 }],
	    setName : fn(arg),
	    setEmail : fn(arg)
	}
    */
  }

  render() {
    const { user } = this.props;
    return (
      <div>
        <h1>{user.name}</h1>
        <h2>{user.email}</h2>
	
	<button onClick={()=>{ 
	  user.setName('jane doe')
	}}> Change Name </button>
	
      </div>
    );
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
      {(user)=> (
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
5. Example showing usage of preloaded state for SSR:  https://stackblitz.com/edit/react-qcasn4?file=store/index.js
6. Using redux-observable: https://stackblitz.com/edit/react-zu8qjn?file=store%2Fuser%2Fepics.js

## Upcoming Features
*No pending feature requests*
> *[Suggest a new feature here](https://github.com/anish000kumar/redux-box/labels/feature)*

## FAQs
1. **Error: ** 
```
Either wrap the root component in a <Provider>, or explicitly pass “store” as a prop to "Connect(MyComponent)
```
  This error occurs because of mismatch among some of dependencies of redux-box, most likely `react-redux`. You can run this  	command to fix this issue for now:
```  
  yarn add react-redux@5.0 
```
1. **Decorators aren't working**

Decorators aren't still a part of es6. To use the decorator syntax you should be using a transpiler like babel. Also, in create-react-app projects the `.babelrc` file doesn't really work so you would need to run `npm run eject` to be able to use custom babel-plugins. Following `.babelrc` should suffice:
```javascript
{
  "plugins": ["transform-decorators-legacy", "styled-components"],
  "presets": [ "react","es2015", "stage-2" ]
}
```

In case you wouldn't like to eject, you can still use redux-box without decorators. Like so:

```javascript

@connectStore({
 ui: uiModule
})
class TestComponent extends React.Component{
  ...
}
export default TestComponent

```

Above snippet is equivalent to:

```javascript

class TestComponent extends React.Component{
  ...
}

export default connectStore({
 ui: uiModule
})(TestComponent)

```

2. **Can I use all the features of redux-box, with `createStore` from redux instead?**

Yes, you can! Here's the script showing how you can use `createStore` from redux, to setup your modules (with reducers, sagas and middlewares):
(v1.3.9 onwards)

```javascript
import { applyMiddleware, combineReducers, compose, createStore } from "redux";
import createSagaMiddleware from "redux-saga";
import { all } from "redux-saga/effects";
import { moduleToReducer } from "redux-box";
import { module as homeModule } from "./home";
import { module as userModule } from "./user";

//hook up your module reducers
const combinedReducer = combineReducers({
  home: moduleToReducer(homeModule),
  user: moduleToReducer(userModule)
});

// hook up your module sagas
const sagas = [...homeModule.sagas, ...userModule.sagas];

// hook up your middlewares here
const sagaMiddleware = createSagaMiddleware();
const middlewares = [sagaMiddleware];

//what follows below is the usual approach of setting up store
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
let enhancer = composeEnhancers(applyMiddleware(...middlewares));

function* rootSaga() {
  yield all(sagas);
}

const store = createStore(combinedReducer, enhancer);
sagaMiddleware.run(rootSaga);
export default store;
```
