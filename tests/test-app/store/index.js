import { createStore } from '../../../src';
import userModule from './user';

export default createStore({
  user: userModule,
});
