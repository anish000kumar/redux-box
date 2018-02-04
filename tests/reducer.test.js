import getReducer from '../src/reducer'
import testModule from './testModule'


describe('getReducer', ()=>{
    it('should convert module to reducer using actionList, initialState', ()=>{
        const reducer = getReducer(testModule.mutations, testModule.state)
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