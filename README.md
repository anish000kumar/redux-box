# redux-box

Setting up and organizing a redux store in your react/ react-native projects can be a tedious and daunting task. 
Redux-Box aims at extracting the complexity in setting up redux box, without loosing the flexibilty or without introducing new bizzare terms.

# Installation
Run this command in your terminal/cmd to install the package:
```
npm install --save redux-box
```

# The Basics

Redux Box allows you to think your whole application in modules. For example, a typical e-commerce can be thought to be composed of some modiles like:
1. Products 
2. User 
3. Orders 

Each of these modules manage their state seperately with the help of five files/ segments:
1. state (this  file specifies the initial state of the module)
2. mutations (this file specifies the function to be run when a specific action is dispatched, it's same as reducer but clutter-free)
3. sagas ( this is where you write all your sagas / async operations)
4. actions (this file contains action creators for your module)
5. index (this file exports a container which encloses the whole module and can be used with render props)

# Usage
..todo..
