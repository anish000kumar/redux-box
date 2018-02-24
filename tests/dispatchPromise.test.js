import {createStore} from '../src'
import testModule from './testModule'
import Module2 from './testModule2'

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
const store2 = createStore(modules )

describe('Store', ()=> {
    it('should have dispatch method', ()=>{
        expect(store).toHaveProperty('dispatch')
        expect(store).toHaveProperty('getState')
        expect(store).toHaveProperty('replaceReducer')
    })
})

describe('Store', ()=> {
    it('should have dispatch method', ()=>{
        expect(store2).toHaveProperty('dispatch')
        expect(store2).toHaveProperty('getState')
        expect(store2).toHaveProperty('replaceReducer')
    })
})