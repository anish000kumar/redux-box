import ACTIONS from './actionTypes';

export default {
  [ACTIONS.SET_FIRSTNAME]: function(state, { firstname }) {
    state.firstname = firstname;
  },
  [ACTIONS.SET_LASTNAME]: function(state, { lastname }) {
    state.lastname = lastname;
  },
  [ACTIONS.SET_ADDRESS]: function(state, { city, country }) {
    state.address.city = city;
    state.address.country = country;
  },
};
