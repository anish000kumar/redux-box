import { createModule } from 'redux-box';

import { initialState } from './state';
import { mutations } from './mutations';
import { dispatchers } from './dispatchers';
import { sagas } from './sagas';

/**
 * Wires the four segments — initial state, immer mutations, intent
 * dispatchers and watcher sagas — into a redux-box module. The returned
 * module has `id`, `getName()`, `getSelector()`, `select(cb)` and
 * `lazySelect(cb)` helpers; selectors live in `./selectors.ts` and use
 * those helpers so they stay decoupled from the slice key chosen in
 * `createStore({ posts: postsModule })`.
 */
const postsModule = createModule({
  state: initialState,
  mutations,
  dispatchers,
  sagas,
});

export default postsModule;

// Re-exports — components and tests should import everything they need
// from this barrel rather than reaching into the implementation files.
export { dispatchers } from './dispatchers';
export { types } from './types';
export type { Post, PostsState } from './state';
