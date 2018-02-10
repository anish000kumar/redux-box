import {createActions, using} from '../src'

let actions = createActions({
    setName : using("name"),
    setProfile: using("name, email, password"),
    setData : (data) => ({ type: 'SET_DATA', data })
})


describe("createActions", ()=>{
    it('should return action',()=>{
        expect(actions.setName('john')).toEqual({
            type: 'SET_NAME',
            name: 'john'
        })
        expect(actions.setProfile('john', 'joh@doe.com', '6154654#Jhgjhgd')).toEqual({
            type: 'SET_PROFILE',
            name: 'john',
            email: 'joh@doe.com',
            password: '6154654#Jhgjhgd'
        })
        expect(actions.setData('some')).toEqual({
            type: 'SET_DATA',
            data: 'some'
        })
    })
})