import {createStore} from '../src'
import testModule from './testModule'

const modules = [testModule]

const config = {
    reducers: {},
    middlewares: [],
    sagas: [],
    decorateReducer : function (reducer){
        return reducer
    }
}

const store = createStore(modules, config )

describe('Store', ()=> {
    it('should have dispatch method', ()=>{
        expect(store).toHaveProperty('dispatch')
        expect(store).toHaveProperty('getState')
        expect(store).toHaveProperty('replaceReducer')
    })
})