import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { Provider } from 'react-redux'
import store from './store';
import Test from './store/testModule';

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <div className="App">
          <Test>
            {(store)=>(
                <div>{store.name}</div>
              )}
          </Test>
        </div>
      </Provider>
    );
  }
}

export default App;
