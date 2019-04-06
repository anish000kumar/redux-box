import module from './index';
import { createSelector as select } from 'selector';
const getUser = module.getSelector();

const getName = select(getUser, user => `${user.firstname} ${user.lastname}`);
const getAddress = select(getUser, user => user.address);

export default {
  getName,
  getAddress,
};
