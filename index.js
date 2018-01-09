"use strict";

import React from 'react';
import {applyMiddleware, combineReducers, compose, createStore as storeCreator} from 'redux';
import {createLogger} from 'redux-logger';
import createSagaMiddleware from "redux-saga";
import { connect } from 'react-redux';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSIONS_COMPOSE__ || compose;
const sagaMiddleware = createSagaMiddleware();
let middlewares = [sagaMiddleware];

if (__DEV__) {
    middlewares = [
        ...middlewares,
        createLogger(), 
    ];
}

const getReducer = (actionList, initialState) => {
	return  ( state = initialState, action) => {
		let method = actionList[action.type];
		let clone_state = JSON.parse(JSON.stringify(state))
		if(method)  return method( clone_state , action);
		else return state
	}
}


let reducers = {};

module.exports = {
	createContainer : (attrs) =>{
		let container =  connect(
		 state => state[attrs.name],
		 attrs.actions,
		)( (props) => props.children(props) );

		return {
			container,
			attrs
		}

	},

	createStore : (containers, new_middlewares) => {
		let saga_array = [];
		  Object.keys(containers).forEach( key => {
			let module = containers[key].attrs;
			saga_array.concat(module.sagas)
			reducers[key] = getReducer( module.mutations , module.state ) 
		})

		// function* rootSaga(){
		// 	yield all(saga_array)
		// }

		middlewares = middlewares.concat(new_middlewares)
		let store = storeCreator(
		    combineReducers(reducers),
		    composeEnhancers(
		        applyMiddleware(...middlewares)
		    )
		);

		// sagaMiddleware.run(rootSaga)
		return store;
	}

}

