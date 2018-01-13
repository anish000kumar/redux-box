import { connect } from 'react-redux';
import {takeLatest, takeEvery, put} from 'redux-saga/effects';
import {STORE, dispatch, commit} from './index';

export const createContainer = (module) =>{
	const mapStateToProps = state => state[module.name]
	const set = function( target, value ){
		STORE.dispatch({
			type : module.name+'__SET',
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
		mapStateToProps
	)(Container);
}


export const createSagas = (saga_list) => {
	let arr = [];
	var GeneratorFunction = Object.getPrototypeOf(function*(){}).constructor
	let saga_keys = Object.keys(saga_list);
	saga_keys.forEach( key => {
		let action = key.split('.')[0];
		let worker_saga = saga_list[key];
		let mode = key.split('.')[1];
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