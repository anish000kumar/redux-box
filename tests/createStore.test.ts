import type { Reducer } from 'redux';
import { createStore } from '../src';
import type { StoreConfig } from '../src/types';
import testModule from './testModule';

const modules = {
  testModule,
};

const config: StoreConfig = {
  reducers: {},
  middlewares: [],
  sagas: [],
  decorateReducer: function(reducer: Reducer) {
    return reducer;
  },
};

export const store = createStore(modules, config);
export const store2 = createStore(modules);

describe('Store', () => {
  it('should have dispatch method', () => {
    expect(store).toHaveProperty('dispatch');
    expect(store).toHaveProperty('getState');
    expect(store).toHaveProperty('replaceReducer');
  });
});

describe('Store', () => {
  it('should have dispatch method', () => {
    expect(store2).toHaveProperty('dispatch');
    expect(store2).toHaveProperty('getState');
    expect(store2).toHaveProperty('replaceReducer');
  });
});
