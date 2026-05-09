import ACTIONS from './actionTypes';

export default {
  setFirstname: (firstname: string) => ({
    type: ACTIONS.SET_FIRSTNAME,
    firstname,
  }),
  setLastname: (lastname: string) => ({
    type: ACTIONS.SET_LASTNAME,
    lastname,
  }),
  setAddress: (city: string, country: string) => ({
    type: ACTIONS.SET_ADDRESS,
    city,
    country,
  }),
  fetchProfile: () => ({ type: ACTIONS.FETCH_PROFILE }),
};
