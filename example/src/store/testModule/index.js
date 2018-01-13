import {createContainer} from 'redux-box';
import state from './state';
import mutations from './mutations';
import sagas from './sagas';

export const module ={
	name : 'test',
	state,
	mutations,
	sagas
}

export default createContainer(module)