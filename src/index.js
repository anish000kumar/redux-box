"use strict";
import produce from 'immer';
import { connect } from 'react-redux';
import {applyMiddleware,combineReducers, compose, createStore as storeCreator} from 'redux';
import createSagaMiddleware from "redux-saga";
import {all, takeLatest, takeEvery, put} from 'redux-saga/effects';
import {assign} from './helpers';
import getReducer from './reducer';

const devTools = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
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
			alert('Something went wrong! Please check your connectivity')
			process.env.NODE_ENV=='development' && console.log(err)
		}
	}
	sagaMiddleware.run(rootSaga);
	STORE = store;
	return store;
}

export const every = (str) => str + '.every'
export const latest = (str) => str + '.latest'

export const commit= (action_name, data) => {
	return STORE.dispatch({
		type : action_name,
		data 
	})
}

export const dispatch= (action) => {
	return STORE.dispatch(action)
}

export const commitAsync = (action_name, data ) =>{
	return new Promise(function(resolve, reject){
		STORE.dispatch({
			type : action_name,
			data,
			resolve,
			reject
		})
	})
}




export const dispatchPromise = (action) => {
	return new Promise(function(resolve, reject){
		STORE.dispatch( object.assign({}, action,{
				resolve,
				reject
			})
		)
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
		 dispatch ,
		 commit,
		 set,
		 dispatchPromise,
		 commitAsync
	}) );
	return connect(
		mapStateToProps,{}
	)(Container);
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

export const connectStore =  (...modules) =>{
    const mapStateToProps = state => {
        let finalState = {};
        Object.keys(modules).forEach( key => {
            const module = modules[key];
            finalState[module.name] = state[module.name];
        })
        return finalState;
    }

    const mergeProps = (state, actions) =>{
        return Object.assign({}, state, actions, {
			commit :commit,
			commitAsync : commitAsync,
			dispatchPromise : dispatchPromise 
		});
	}
	
    return connect(mapStateToProps,null,mergeProps);
}


export default {
	createContainer,
	createSagas,
	createStore,
	dispatch,
	commit
}

