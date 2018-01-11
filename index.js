"use strict";
import React from 'react';
import {applyMiddleware,combineReducers, compose, createStore as storeCreator} from 'redux';
import createSagaMiddleware from "redux-saga";
import { connect } from 'react-redux';
import { all } from 'redux-saga/effects';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSIONS_COMPOSE__ || compose;
const sagaMiddleware = createSagaMiddleware();
let middlewares = [sagaMiddleware];


export const getReducer = (actionList, initialState) => {
	return  ( state = initialState, action) => {
		let method = actionList[action.type];
		let clone_state = JSON.parse(JSON.stringify(state))
		if(method)  return method( clone_state , action);
		else return state
	}
}

export const createContainer = (module) =>{
	const mapStateToProps = state => state[module.name]
	const Container = (props) => props.children(props);
	return connect(
		mapStateToProps,
		module.actions,
	)(Container);
}
	
export const createStore = (modules, new_middlewares) => {
	middlewares = middlewares.concat(new_middlewares);
	let reducerList = {}
	let sagas = [];
	modules.forEach(module => {
		sagas = sagas.concat(module.sagas);
		reducerList[module.name] = getReducer( module.mutations, module.state ) 		
	})
	
	let store = storeCreator(
		combineReducers(reducerList),
		composeEnhancers( applyMiddleware(...middlewares))
	)
	function *rootSaga(){
		yield all(sagas)
	}
	sagaMiddleware.run(rootSaga);
	return store;
}

export default {
	createContainer,
	createStore,
	getReducer
}
