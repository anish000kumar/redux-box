import { createModule } from '../../../../src';
import getState from './state';
import mutations from './mutations';
import sagas from './sagas';
import selectors from './selectors';
import dispatchers from './dispatchers';

const userModule = createModule({
  state: getState(),
  mutations,
  selectors,
  sagas,
  dispatchers,
});

export default userModule;
