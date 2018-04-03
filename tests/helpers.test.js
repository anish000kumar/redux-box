import {moduleToReducer} from '../src'
import {every, latest} from '../src'
import testModule from './testModule'
import {createActions, using} from '../src/helpers'

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

describe('using', ()=>{
	it('should return array', ()=>{
		expect(using('test, test2')).toEqual(['test', 'test2'])
		expect(using()).toEqual([]),
		expect(createActions({ test:using() }).test() ).toEqual({type:'TEST'})
		expect(createActions({ testOnly:using('name') }).testOnly() ).toEqual({type:'TEST_ONLY'})
	})
})