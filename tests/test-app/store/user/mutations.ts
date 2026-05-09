import ACTIONS from './actionTypes';

export default {
  [ACTIONS.SET_FIRSTNAME]: function(
    state: any,
    { firstname }: { firstname: string }
  ) {
    state.firstname = firstname;
  },
  [ACTIONS.SET_LASTNAME]: function(
    state: any,
    { lastname }: { lastname: string }
  ) {
    state.lastname = lastname;
  },
  [ACTIONS.SET_ADDRESS]: function(
    state: any,
    { city, country }: { city: string; country: string }
  ) {
    state.address.city = city;
    state.address.country = country;
  },
};
