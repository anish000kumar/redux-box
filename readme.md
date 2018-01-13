# redux-box
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