import type { StoreConfig } from './types';
/**
 * compose function for redux.
 * Detects the environment using config.enableDevtools,
 * if that's not provided by user, used process.env.NODE_ENV.
 *
 * @param {Object} config - configuration object
 * @param {Function} config.enableDevTools - Enable redux devTools in the browser if it returns true
 * @param {Function} config.composeRedux -  Use a custom compose function for redux, it has existing compose function as the argument
 * @returns {Function} composer - compose function fed to redux
 */
declare function composeEnhancers(config?: StoreConfig): any;
export default composeEnhancers;
