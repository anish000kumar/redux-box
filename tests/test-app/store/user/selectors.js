import module from './index';

const getName = module.select(state => {
  return `${state.firstname} ${state.lastname}`;
});

const getAddress = module.select(state => {
  return state.address;
});

const getAddressField = module.dynamicSelect((state, fieldName) => {
  return state.address[fieldName];
});

export default {
  getName,
  getAddress,
  getAddressField,
};
