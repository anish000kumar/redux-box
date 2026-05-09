const state = {
  name: 'John',
  email: 'john@doe.com',
};

const dispatchers = {
  setName: name => ({ type: 'SET_NAME', name }),
  setEmail: email => ({ type: 'SET_EMAIL', email }),
};

const mutations = {
  SET_NAME: (state, action) => (state.name = action.name),
  SET_EMAIL: (state, action) => (state.email = action.email),
};

const sagas = {};

export default {
  state,
  dispatchers,
  mutations,
  sagas,
  decorateReducer: reducer => reducer,
};
