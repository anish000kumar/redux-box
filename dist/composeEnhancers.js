"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _redux = require("redux");

var _get = _interopRequireDefault(require("./utils/get"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

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
function composeEnhancers() {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var devCompose = (typeof window === "undefined" ? "undefined" : _typeof(window)) === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__(config.devToolOptions || {});
  /* if devtools should be enabled, use devTools if available, else use default compose function */


  var composer = shouldEnableDevTools(config) ? devCompose || _redux.compose : _redux.compose;
  /* if use wants to override above composer function, use that */

  if (!!config && !!config.composeRedux) {
    var finalComposer = config.composeRedux(composer);

    if (typeof finalComposer === 'function') {
      return finalComposer;
    }

    console.warn("composeRedux() should return function (compose), provided: ".concat(config.composeRedux));
  }

  return composer;
}

function shouldEnableDevTools(config) {
  var enableToolsFn = (0, _get["default"])(config, 'enableDevTools');
  /* if user provides enableDevTools function use that */

  if (enableToolsFn && typeof enableToolsFn !== 'function') {
    console.warn("config.enableDevTools should be a function returning true or false you \n       have provided ".concat(_typeof(enableToolsFn), ": ").concat(enableToolsFn));
  } else if (enableToolsFn) return enableToolsFn();
  /* else, check for the development environment to enable dev tools */


  if ((typeof process === "undefined" ? "undefined" : _typeof(process)) === 'object' && (0, _get["default"])(process, 'env.NODE_ENV') !== 'production') {
    return true;
  }
  /* else, return false */


  return false;
}

var _default = composeEnhancers;
exports["default"] = _default;