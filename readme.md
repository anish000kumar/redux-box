<p align="center"><a href="#" target="_blank">
	<img style="max-width:700px" src="https://image.ibb.co/e4Nce6/redux_box.png" alt="redux_box" border="0">
</a></p>

# Redux Box
Setting up and organizing a redux store in your react/ react-native projects can be a tedious and daunting task. Redux-Box aims at extracting the complexity in setting up redux with redux-saga, without loosing the flexibilty or without introducing new bizzare terms.

# Installation
Run this command in your terminal/cmd to install the package:
```
npm install --save redux-box
```

# The Basics

Redux box emphasizes on dividing the whole application into multiple modules. Each of these modules manages it's state seperately, with the help of 4 segments:

1. state 
(It specifies the initial state of the module)

2. mutations 
(It specifies the function to be run when a specific action is dispatched, it's same as reducer but clutter-free)

3. actions
(it contains the actionCreators for your store. Each method of this object must return an action object  )

4. sagas 
( this is where you write all your sagas / async operations)

# Live Examples
Here are some examples to let you play around with redux-box
1. Basic example - https://stackblitz.com/edit/react-3c8vsn?file=Hello.js
2. Example showing redux-saga usage: - https://stackblitz.com/edit/react-qmedt4?file=Hello.js
3. Example with redux-form: https://stackblitz.com/edit/react-w4dqth?file=store%2Findex.js

# Usage
## step 1: create a module
Make sure you specify a unique name for each module ('user' in this example)
```javascript
import {createSagas, createContainer} from 'redux-box'
import {call} from 'redux-saga/effects'

// store/user.js

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

## step 2 : register the module in redux store

```javascript
import {createStore} from 'redux-box'
//import all your modules here
import {module as userModule} from './user'
import {module as postModule} from './post'

const modules = [ userModule, postModule]

export default createStore(modules)

/*
OPTIONAL: if you need to create store with some reducers and middlewares, the signature of createStore method from redux-box goes like this:

createStore(modules : Array, reducers : Object, middlewares: Array)

*/

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
## step 3: Use the module in component

### through decorator
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
### or through render props

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


