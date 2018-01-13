[](redux-box.png)
# Redux Box
Setting up and organizing a redux store in your react/ react-native projects can be a tedious and daunting task. 
Redux-Box aims at extracting the complexity in setting up redux with redux-saga, without loosing the flexibilty or without introducing new bizzare terms.

# Installation
Run this command in your terminal/cmd to install the package:
```
npm install --save redux-box
```

# The Basics

Redux box emphasizes on dividing the whole application into multiple modules. Each of these modules manage it's state seperately, with the help of 4 files/ segments:

1. state 
(this  file specifies the initial state of the module)

2. mutations 
(this file specifies the function to be run when a specific action is dispatched, it's same as reducer but clutter-free)

3. sagas 
( this is where you write all your sagas / async operations)

4. index 
(this file exports a container which encloses the whole module and can be used with render props)

# Usage
1. Setting up the files :
 The  directory structure would look something like below. `store` directory has an `index.js` file and various modules as shown below.

```
|-src
|---store
|------userModule
|--------state.js
|--------mutations.js
|--------sagas.js
|----index.js
|---index.js
```

2. Creating a redux store : 

`store/index.js`
```
import { module as userModule} from './userModule';
import {module as someOtherModule} from './someOtherModule';

import {createStore} from 'redux-box';

export default createStore([
	userModule,
	someOtherModule
])
```

Finally you  need to wrap your root component in the `<Provider> </Provider>` which can be imported from `redux`;
And that's all you would need to setup redux and redux-saga for your application in a modular way.

#Understaing the Module
##1. state.js
It exports an object specifying the initial state for the parent module.
Example:
`userModule/state.js`
```
export default {
	name : '',
	email : '',
	age : '',
	orders : []
}
```

##2. mutations.js
It's a clutter-free version of the typical reducer we use with redux. it exports an object with multiple functions. Each function name matches certain action type. When an action is dispatched from anywhere in the application, the corresponding method is run and it mutates the state accordingly. Each `mutation` accepts two arguments: a copy of the state of it's module and the action that triggers the mutations. Here's an example : 
`userModule/mutations.js`

```
export default {
	SET_USER_NAME (state, action){
		state.name = action.data;
	}
}
```

Each `mutation` receives a copy of the state hence you can directly change the object. Also, you don't need to return the changed state object, `redux-box` handles that for you behind the scenes.

##3. Sagas
Sagas are used to handle the async operations we might need to perform in our application. Usually to trigger an async process, you would need two sagas: Watcher saga and Worker saga. `redux-box` make this process clutter free as well, by providing you with a method called `createSagas`. It's optional to use, and you may want to stick to traditional process of managing sagas, if you need more flexibility. But for most use cases `createSagas` can extract away quite a bit of noise. Each Worker saga receives the triggering action as the argument:
`userModule/Sagas.js`
```
import {createSagas} from 'redux-box/helpers';
import {put} from 'redux-saga';

import api from './api'

export default createSagas({
	'GET_ORDERS_LIST.latest' : function* (action){
		try{
			yield result = api.getOrders(action.data.id)
			yield action.resolve('done')
			// more aboue the action.resolve is covered in the last section (below).
		}
		catch(err){
			action.reject(err)
			//...etc
		}
	}
})
```
Above code means when SET_USER_NAME action is dispatched anywhere in the app, run the saga mentioned against it. Also, notice the `latest` modifier alongside the action name. It's equivalent of `takeLatest` from 'redux-saga'. You can also use `every` which would produce the same effect as `takeEvery` from 'redux-saga'.

##4. index.js
It's the heart of a module which binds all the pieces together. It exports two things : a module and a container (which will be used in any component where you need this module).
Here's how it typically goes:
`userModule/index.js`
```
import {createContainer} from 'redux-box/helpers';

import state from './state'
import mutations from './mutations'
import sagas from './sagas'

export const module = {
	name : 'user' // it's important to specify a unique name for each module
	state,
	mutations,
	sagas
}

export default createContainer(module)

```

#Now the magic!
Once you have structures the module and it's files. You are ready to "code at speed of thought" with redux-box. Let's say I need the userModule in my `App.js` file. Here we go:

`App.js`
```
import React, { Component } from 'react';
import UserContainer from './store/userModule'

class App extends Component {
  render() {
    return (
          <UserContainer>
            {(user)=>(
               <h1> {user.name} </h1>

				<button onClick={()=> store.commit('SET_USER_NAME', 'Roy') } > 
				 Change name to Roy 
				</button>

				<button onClick={()=> {
					store.dispatch('GET_ORDERS_LIST')
					.then( res => alert('orders updated') )
					.catch(err => alert(err.messsage) )
				}} > 
				 Get Orders from Api
				</button>
            )}
          </UserContainer>
    )
  }
}

export default App
```

The above example illustrate the three major jobs of the module-container. 
- Firstly, you can directly access  the state through the container as shown above.
- Secondly, you can call any `mutation` or `saga` by using `store.commit` functions, which accepts two arguments : the action name and the data (payload) . The signature for any action returned by the `store.commit` is : 
```
{
	type : 'ACTION_NAME'
	data : //.. data you attach as the second argumento to commit method
}
```
-Thirdly, if you need to do something after your saga is finished, you would use `store.dispatch` instead of `store.commit`. it will also trigger the mutations and sagas, associated with the underlying action, but additionally it returns a `Promise`. The `store.dispatch` method basically attached `resolve` and `reject` keys to the causing action, which you can yield from you sagas, as you could see in the example saga above.