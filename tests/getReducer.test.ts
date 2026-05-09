import getReducer from '../src/getReducer';
import testModule from './testModule';

describe('getReducer', () => {
  it('should return reducer', () => {
    const reducer = getReducer(testModule.mutations, testModule.state);
    const action = {
      type: 'SET_NAME',
      name: 'jane',
    };
    let res = reducer(testModule.state, action);
    expect(res).toEqual({
      name: 'jane',
      email: 'john@doe.com',
    });
  });
});
