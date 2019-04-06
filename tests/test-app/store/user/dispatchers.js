import ACTIONS from './actionTypes';

export default {
  setFirstname: firstname => ({ type: ACTIONS.SET_FIRSTNAME, firstname }),
  setLastname: lastname => ({ type: ACTIONS.SET_LASTNAME, lastname }),
  setAddress: (city, country) => ({ type: ACTIONS.SET_ADDRESS, city, country }),
};
