import type { Module, StoreConfig } from './types';
/**
 * @typedef {Object} Module - Object representing module
 * @property {Object=} state - Initial state for the module
 * @property {Object<String, Function>=} dispatchers - Action dispatchers for the module
 * @property {Object<String, Generator>=} sagas - Sagas for the module
 * @property {Object<String, Function>=} mutations - Mutations for the module
 * @property {Object<String, Function>=} selectors - Selector for the module
 */
/**
 * Creates redux store
 * @example
 * import { createStore } from "redux-box";
 * import userModule from "./modules/user";
 * import marketplaceModule from "./modules/marketplace";
 *
 * createStore({userModule, marketplaceModule},{
 *  enableDevTools: () => true,
 *  devToolOptions: {}
 * })
 *
 * @param {Object<String, Module>} modules - Object containing all modules to be attached to store
 * @param {Function=} config.enableDevTools - (Optional)enable devtool conditionally
 * @param {Object} config -  Contains configuration for store
 * @param {Function[]} config.middlewares - Array of middlewares to be used in store
 * @param {Object<String, Function>=} config.reducers - (Optional) Object containing reducers to be used in store
 * @param {Generator[]} config.sagas - Array of watcher sagas to be used in store
 * @param {Object=} config.preloadedState - (Optional) Preloaded state for store
 * @param {Object=} config.devToolOptions - (Optional) options for redux dev tool
 * @param {Function=} config.decorateReducer - (Optional) decorator function for reducer formed by redux-box, has formed reducer as first argument
 * @returns {Object} store
 */
declare function createStore(modules: Record<string, Module>, config?: StoreConfig): import("redux").Store<{
    [x: string]: unknown;
}, import("redux").Action<string>, unknown>;
export default createStore;
