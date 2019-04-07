import module from './index';

const getName = module.select(state => {
  return `${state.firstname} ${state.lastname}`;
});

const getAddress = module.select(state => {
  return state.address;
});

export default {
  getName,
  getAddress,
};
