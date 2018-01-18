"use strict";
import React from 'react';
import produce from 'immer';
import { connect } from 'react-redux';
import {applyMiddleware,combineReducers, compose, createStore as storeCreator} from 'redux';
import createSagaMiddleware from "redux-saga";
import {all, takeLatest, takeEvery, put} from 'redux-saga/effects';
import {assign} from './helpers';
import getReducer from './reducer';

const devTools = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
const composeEnhancers =  devTools || compose;

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
		try{
			yield all(sagas)
		}
		catch(err){
			alert('Something went wrong! Please check your connecitivity')
			process.env.NODE_ENV=='development' && console.log(err)
		}
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

export const latest = (str) => str +'.latest'
export const every = (str) => str + '.every'

export const dispatch= (action) => {
	return STORE.dispatch(dispatch)
}

export const dispatchPromise = (action) => {
	return new Promise(function(resolve, reject){
		STORE.dispatch(Object.assign({}, action,{
			resolve,
			reject
		}))
	})
}



export const createContainer = (module) =>{
	const mapStateToProps = state => state[module.name]
	const set = function( target, value ){
		STORE.dispatch({
			type :'__SET__'+module.name,
			data :{
				target,
				value
			}
		})
	}
	const Container = (props) => props.children( Object.assign({}, props, {
		 dispatch : dispatch,
		 commit : commit,
		 set: set
	}) );
	return connect(
		mapStateToProps,{}
	)(Container);
}

export const inject = (modules) {
	mapStateToProps(state){
		let finalObj ={};
		Object.keys(modules).forEach(key => {
			let module = modules[key];
			finalObj.key = state[module.name]
		})
		return finalObj;
	}
	return (WrappedComponent) => {
		@connect(mapStateToProps,{})
		class StoreWrapper extends React.Component{
			render(){
				<WrappedComponent
				dispatch={dispatch}
				commit={commit}
				{...this.props}
				>
				</WrappedComponent>
			}
		}
	}
}



export const createSagas = (saga_list) => {
	let arr = [];
	var GeneratorFunction = Object.getPrototypeOf(function*(){}).constructor
	let saga_keys = Object.keys(saga_list);
	saga_keys.forEach( key => {
		let action = key.split('.')[0];
		let worker_saga = saga_list[key];
		let mode = key.split('.')[1] || 'latest';
		let watcher = null;
		if(mode=='latest'){
			watcher = function* (){
				yield takeLatest(action, worker_saga)
			}
		}
		else if(mode == 'every'){
			watcher = function* (){
				yield takeEvery(action, worker_saga)
			}
		}
		arr.push(watcher())
	})
	return arr;
}

export default {
	createContainer,
	createSagas,
	createStore,
	dispatch,
	commit
}

