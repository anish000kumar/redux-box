/**
 * @file Public entry point for redux-box. Re-exports the four building blocks
 * you need to wire up a redux store with the redux-box conventions:
 *
 * - {@link createStore} - builds the redux store from a map of modules and config.
 * - {@link connectStore} - thin wrapper over `react-redux`'s `connect` that maps
 *   state, selectors and dispatchers onto a component.
 * - {@link createSagas} - turns a `{ ACTION_TYPE: workerSaga }` map into an
 *   array of watcher sagas (`takeLatest` by default, opt-in `takeEvery`).
 * - {@link createModule} - wraps a plain `{ state, mutations, sagas, selectors,
 *   dispatchers }` object into a redux-box module with helpers like `select`.
 *
 * @example
 * import {
 *   createStore,
 *   connectStore,
 *   createSagas,
 *   createModule,
 * } from 'redux-box';
 */

export { default as createStore } from './createStore';
export { default as connectStore } from './connectStore';
export { default as createSagas } from './createSagas';
export { default as createModule } from './createModule';
export { default as dynamicSelector } from './dynamicSelector';
