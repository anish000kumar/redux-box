import { createStore } from 'redux-box';

import boardModule from './board';
import uiModule from './ui';

export const store = createStore(
  { board: boardModule, ui: uiModule },
  { enableDevTools: () => process.env.NODE_ENV !== 'production' }
);

export type RootState = ReturnType<typeof store.getState>;
