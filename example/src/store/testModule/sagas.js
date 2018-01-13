import {createSagas} from 'redux-box'
export default createSagas({

    'SET_NAME.latest' : function* (){
        yield alert('saga works!! from example/store/testModule/sagags.js')
    }

})