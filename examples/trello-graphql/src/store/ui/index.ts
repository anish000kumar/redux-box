import { createModule } from 'redux-box';

import { initialState } from './state';
import { mutations } from './mutations';
import { dispatchers } from './dispatchers';
import { sagas } from './sagas';

const uiModule = createModule({
  state: initialState,
  mutations,
  dispatchers,
  sagas,
});

export default uiModule;

export { dispatchers } from './dispatchers';
export { types } from './types';
export type { UiState } from './state';
