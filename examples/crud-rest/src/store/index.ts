import { createStore } from 'redux-box';

import postsModule from './posts';
import uiModule from './ui';

/**
 * Single source of truth for the store. Both modules are mounted with the
 * same key the selectors expect (`posts`, `ui`); selectors built via
 * `module.select` / `module.lazySelect` would still work if these keys were
 * renamed, but matching the conventional name keeps Redux DevTools readable.
 */
export const store = createStore(
  { posts: postsModule, ui: uiModule },
  { enableDevTools: () => process.env.NODE_ENV !== 'production' }
);

export type RootState = ReturnType<typeof store.getState>;
