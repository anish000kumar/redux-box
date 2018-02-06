"use strict";
import polyfill from 'babel-polyfill'
import produce from 'immer';
import { connect } from 'react-redux';
import {applyMiddleware,combineReducers, compose, createStore as storeCreator} from 'redux';
import createSagaMiddleware from "redux-saga";
import {all, takeLatest, takeEvery, put} from 'redux-saga/effects';
import getReducer from './reducer';

const devTools = window && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
const composeEnhancers =  devTools || compose;

const sagaMiddleware = createSagaMiddleware();
let middlewares = [sagaMiddleware];

export let STORE = null;

//config = {reducers:{}, sagas:[], middlewares}
export const createStore = (modules, config) => {
	if(config && config.middlewares && config.middlewares.length > 0){
		middlewares = middlewares.concat(config.middlewares);
	}
	let reducerList = Object.assign({}, config.reducers);
	let sagas = [];
	modules.forEach(module => {
		sagas = sagas.concat(module.sagas);
		let moduleReducer = getReducer( module.mutations, module.state ) 
		if(module.decorateReducer){
			moduleReducer = module.decorateReducer(moduleReducer)
		}
		reducerList[module.name] = moduleReducer		
	})
	config.sagas && config.sagas.forEach(saga => sagas.concat(saga) )
	
	let combinedReducer = combineReducers(reducerList);
	if(config.decorateReducer){
		combinedReducer = config.decorateReducer(combinedReducer)
	}
	let store = storeCreator(
		combinedReducer,
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

export const commit= (action_name, data) => {
	return STORE.dispatch({
		type : action_name,
		data 
	})
}

const dispatch= (action) => {
	return STORE.dispatch(action)
}

const commitAsync = (action_name, data ) =>{
	return new Promise(function(resolve, reject){
		STORE.dispatch({
			type : action_name,
			data,
			resolve,
			reject
		})
	})
}

const dispatchPromise = (action) => {
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
	const mapDispatchToProps = dispatch => {
		return Object.keys(module.actions).map( key => {
			let action = module.actions[key];
			return dispatch(action());
		} )
	}
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
		mapStateToProps, module.actions || {}
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

export const connectStore =  (modules) =>{
    const mapStateToProps = state => {
        let finalState = {};
        Object.keys(modules).forEach( key => {
            const module = modules[key];
            finalState[key] = state[module.name];
		})
        return finalState;
    }

    const mapDispatchToProps = (dispatch) => {
    	let finalProps = {};
        Object.keys(modules).forEach( key => {
            const module = modules[key];
            const module_actions = {};
			if(module.actions){
				Object.keys(module.actions).forEach(action_key =>{
					const action = module.actions[action_key];
					module_actions[action_key] = (...args) => {
						return dispatch( action(...args) )
					};
				})
				finalProps[key] = module_actions
			}
        })
        return finalProps;
    }

    const mergeProps = (state, actions, ownProps) =>{
		let finalModule  ={};
		Object.keys(state).forEach(key => {
			let module_state = state[key];
			let module_actions = actions[key];
			finalModule[key] = Object.assign({}, module_state, module_actions)
		})
        return Object.assign({}, finalModule, {
			commit :commit,
			commitAsync : commitAsync,
			dispatch : dispatch,
			dispatchPromise : dispatchPromise 
		},ownProps);
	}
	
    return connect(mapStateToProps,mapDispatchToProps,mergeProps);
}

//helpers
export const every = (str) => str + '.every'
export const latest = (str) => str + '.latest'
export const moduleToReducer = (module) => getReducer( module.mutations, module.state ) 

export default {
	createContainer,
	createSagas,
	createStore,
	connectStore
}

