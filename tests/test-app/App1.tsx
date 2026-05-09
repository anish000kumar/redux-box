import React, { Component } from 'react';
import { connectStore } from '../../src';
import userDispatchers from './store/user/dispatchers';
import userSelectors from './store/user/selectors';

interface AppProps {
  username: string;
  country: string;
  getAddressField: (fieldName: string) => string;
  setFirstname: (firstname: string) => void;
  fetchProfile: () => void;
}

class App extends Component<AppProps> {
  render() {
    return (
      <div>
        <h1 data-testid="username">{this.props.username}</h1>
        <h2 data-testid="country">{this.props.country}</h2>
        <h3 data-testid="dynamic-country">
          {this.props.getAddressField('country')}
        </h3>
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
  mapState: (state: any) => ({
    country: state.user.address.country,
  }),
  mapSelectors: {
    username: userSelectors.getName,
    address: userSelectors.getAddress,
    getAddressField: userSelectors.getAddressField,
  },
  mapDispatchers: {
    setFirstname: userDispatchers.setFirstname,
    fetchProfile: userDispatchers.fetchProfile,
  },
})(App);
