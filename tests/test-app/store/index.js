import { createStore } from '../../../src';
import userModule from './user';

const store = createStore({
  user: userModule,
});

export default store;
