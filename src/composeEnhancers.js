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
function composeEnhancers(config = {}) {
  const devCompose =
    typeof window === 'object' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__(config.devToolOptions || {});

  /* if devtools should be enabled, use devTools if available, else use default compose function */
  const composer = shouldEnableDevTools(config)
    ? devCompose || compose
    : compose;
  /* if use wants to override above composer function, use that */
  if (!!config && !!config.composeRedux) {
    const finalComposer = config.composeRedux(composer);
    if (typeof finalComposer === 'function') {
      return finalComposer;
    }
    console.warn(
      `composeRedux() should return function (compose), provided: ${config.composeRedux}`
    );
  }

  return composer;
}

function shouldEnableDevTools(config) {
  const enableToolsFn = get(config, 'enableDevTools');
  /* if user provides enableDevTools function use that */
  if (enableToolsFn && typeof enableToolsFn !== 'function') {
    console.warn(
      `config.enableDevTools should be a function returning true or false you 
       have provided ${typeof enableToolsFn}: ${enableToolsFn}`
    );
  } else if (enableToolsFn) return enableToolsFn();
  /* else, check for the development environment to enable dev tools */
  if (
    typeof process === 'object' &&
    get(process, 'env.NODE_ENV') !== 'production'
  ) {
    return true;
  }

  /* else, return false */
  return false;
}

export default composeEnhancers;
