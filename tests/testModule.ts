import type { Reducer } from 'redux';

const state = {
  name: 'John',
  email: 'john@doe.com',
};

const dispatchers = {
  setName: (name: string) => ({ type: 'SET_NAME', name }),
  setEmail: (email: string) => ({ type: 'SET_EMAIL', email }),
};

const mutations = {
  SET_NAME: (state: any, action: any) => (state.name = action.name),
  SET_EMAIL: (state: any, action: any) => (state.email = action.email),
};

const sagas: any[] = [];

export default {
  state,
  dispatchers,
  mutations,
  sagas,
  decorateReducer: (reducer: Reducer) => reducer,
};
