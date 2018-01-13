"use strict";
import React from 'react';
import produce from 'immer';
import {applyMiddleware,combineReducers, compose, createStore as storeCreator} from 'redux';
import createSagaMiddleware from "redux-saga";
import {all} from 'redux-saga/effects';
import {assign, createContainer, createSagas} from './helpers';
import getReducer from './reducer';


const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSIONS_COMPOSE__ || compose;
const sagaMiddleware = createSagaMiddleware();
let middlewares = [sagaMiddleware];


export let STORE = null;
export const createStore = (modules, reducers={}, new_middlewares=[]) => {
	middlewares = middlewares.concat(new_middlewares);
	let reducerList = Object.assign({}, reducers);
	let sagas = [];
	modules.forEach(module => {
		sagas = sagas.concat(module.sagas);
		reducerList[module.name] = getReducer(module.name, module.mutations, module.state ) 		
	})
	
	let store = storeCreator(
		combineReducers(reducerList),
		composeEnhancers( applyMiddleware(...middlewares))
	)
	function *rootSaga(){
		yield all(sagas)
	}
	sagaMiddleware.run(rootSaga);
	STORE = store;
	return store;
}

export const commit= (action_name, data) => {
	return STORE.dispatch({
		type : action_name,
		data 
	})
}

export const dispatch = (action_name, data ) =>{
	return new Promise(function(resolve, reject){
		STORE.dispatch({
			type: action_name,
			resolve,
			reject,
			data
		})
	})
}

export default {
	createContainer,
	createSagas,
	createStore,
	getReducer,
	dispatch,
	commit
}

