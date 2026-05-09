import { createModule } from 'redux-box';

import { initialState } from './state';
import { mutations } from './mutations';
import { dispatchers } from './dispatchers';
import { sagas } from './sagas';

const boardModule = createModule({
  state: initialState,
  mutations,
  dispatchers,
  sagas,
});

export default boardModule;

export { dispatchers } from './dispatchers';
export { types, COLUMN_IDS, COLUMN_LABELS, type ColumnId } from './types';
export type { Card, BoardState } from './state';
