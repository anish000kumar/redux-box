import {moduleToReducer} from '../src'
import testModule from './testModule'


describe('moduleToReducer', () => {

  it('should return reducer', () => {
 	const reducer = moduleToReducer(testModule);
 	console.log(reducer)
 	const action ={
 		type : 'SET_NAME',
 		name : 'jane'
 	}
    expect(reducer(testModule.state,action).toEqual({
		    	name : 'jane',
		    	email : 'john@doe.com'
		    })
    )
  })

})