import {moduleToReducer} from '../src/helpers'
import {every, latest} from '../src/helpers'
import testModule from './testModule'

describe('moduleToReducer', () => {
  it('should return reducer', () => {
 	const reducer = moduleToReducer(testModule);
 	const action ={
 		type : 'SET_NAME',
 		name : 'jane'
 	}
	 let res = reducer(testModule.state,action);
   expect(res).toEqual({
		    	name : 'jane',
		    	email : 'john@doe.com'
		    })
  })
})

describe('every and latest', ()=>{
	it('should return string', ()=>{
		expect(every('test')).toBe('test.every')
		expect(latest('test')).toBe('test.latest')
	})
})