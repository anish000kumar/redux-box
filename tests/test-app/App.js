import React, { Component } from 'react';
import { connectStore } from '../../src';
import userDispatchers from './store/user/dispatchers';
import userSelectors from './store/user/selectors';

class App extends Component {
  render() {
    return (
      <div>
        <h1>{this.props.username}</h1>
        <button onClick={this.props.fetchProfile} />
      </div>
    );
  }
}

export default connectStore({
  mapSelectors: {
    username: userSelectors.getName,
  },
  mapDispatchers: {
    fetchProfile: userDispatchers.fetchProfile,
  },
})(App);
