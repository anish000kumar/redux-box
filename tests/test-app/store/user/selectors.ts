import userModule from './index';

const getName = userModule.select((state: any) => {
  return `${state.firstname} ${state.lastname}`;
});

const getAddress = userModule.select((state: any) => {
  return state.address;
});

export default {
  getName,
  getAddress,
};
