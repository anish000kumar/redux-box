import React from 'react'
import TestUtils from 'react-addons-test-utils'
import {connectStore} from '../src'
import {store} from './store.test'
import testModule from './testModule'
const ReactTestRenderer = require('react-test-renderer');

class Test extends React.Component{
    render(){
        return (<div></div>)
    }
}
const TestComp = connectStore({
    module: testModule
})(Test)

describe('ConnectStore',() => {
    it('Should provide state and actions in prop',()=>{
        const renderer = TestUtils.createRenderer();
        renderer.render(<TestComp/>)
        const output = renderer.getRenderOutput();
        debugger
    })
})