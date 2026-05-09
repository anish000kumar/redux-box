import userModule from './index';

const getName = userModule.select((state: any) => {
  return `${state.firstname} ${state.lastname}`;
});

const getAddress = userModule.select((state: any) => {
  return state.address;
});

const getAddressField = userModule.dynamicSelect(
  (state: any, fieldName: string) => {
    return state.address[fieldName];
  }
);

export default {
  getName,
  getAddress,
  getAddressField,
};
