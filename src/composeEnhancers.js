import { compose } from 'redux';
import get from './utils/get';

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
export default function composeEnhancers(config) {
  const devTools =
    typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;

  /* if devtools should be enabled, use devTools if available, else use default compose function */
  let composer = shouldEnableDevTools(config) ? devTools || compose : compose;

  /* if use wants to override above composer function, use that */
  if (config && config.composeRedux) {
    return config.composeRedux(composer);
  }
  return composer;
}

function shouldEnableDevTools(config) {
  /* if user provides enableDevTools function use that */
  if (typeof config.enableDevTools !== 'function') {
    console.warn(
      `config.enableDevTools should be a function returning true or false
       you have provided ${typeof config.enableDevTools}: ${
        config.enableDevTools
      }
      `
    );
  } else if (config && config.enableDevTools)
    return config.enableDevTools(devMode);

  /* else, check for the development environment to enable dev tools */
  if (
    typeof process == 'object' &&
    get(process, 'env.NODE_ENV') === 'development'
  )
    return true;

  /* else, return false */
  return false;
}
