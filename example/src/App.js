import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { Provider } from 'react-redux'
import store from './store';
import Test from './store/testModule';

class App extends Component {

  changeName = (e, store) =>{
    store.commit('SET_NAME', e.target.value)
  }

  render() {
    return (
      <Provider store={store}>
        <div className="App">
          <Test>
            {(store)=>(
               <div>
                  <div>{store.name}</div>
                  <input type="text" onChange={(e)=> this.changeName(e, store)}/>
               </div>
              )}
          </Test>
        </div>
      </Provider>
    );
  }
}

export default App;
