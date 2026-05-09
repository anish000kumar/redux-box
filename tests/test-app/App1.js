import React, { Component } from 'react';
import { connectStore } from '../../src';
import userDispatchers from './store/user/dispatchers';
import userSelectors from './store/user/selectors';

class App extends Component {
  render() {
    return (
      <div>
        <h1 data-testid="username">{this.props.username}</h1>
        <h2 data-testid="country">{this.props.country}</h2>
        <button
          data-testid="change-firstname"
          onClick={this.props.setFirstname.bind(this, 'anish')}
        />
        <button data-testid="fetchProfile" onClick={this.props.fetchProfile} />
      </div>
    );
  }
}

export default connectStore({
  mapState: state => ({
    country: state.user.address.country,
  }),
  mapSelectors: {
    username: userSelectors.getName,
    address: userSelectors.getAddress,
  },
  mapDispatchers: {
    setFirstname: userDispatchers.setFirstname,
    fetchProfile: userDispatchers.fetchProfile,
  },
})(App);
