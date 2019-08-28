"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _reduxSaga = _interopRequireDefault(require("redux-saga"));

var _effects = require("redux-saga/effects");

var _redux = require("redux");

var _get = _interopRequireDefault(require("./utils/get"));

var _composeEnhancers = _interopRequireDefault(require("./composeEnhancers"));

var _moduleRegistry = _interopRequireDefault(require("./moduleRegistry"));

var _getReducer = _interopRequireDefault(require("./getReducer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

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
function createStore(modules) {
  var _marked =
  /*#__PURE__*/
  regeneratorRuntime.mark(rootSaga);

  var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  //  Array containing names of all registered modules
  var moduleNames = Object.keys(modules); // Initialize the middleware array

  var sagaMiddleware = (0, _reduxSaga["default"])();
  var middlewares = [sagaMiddleware]; // push the provided middlewares in config object, to the middleware array

  if ((0, _get["default"])(config, 'middlewares.length', 0) > 0) {
    middlewares = middlewares.concat(config.middlewares);
  } // an object containing reducers for all modules, to  be fed to combineReducer


  var reducerList = Object.assign({}, config.reducers);
  var sagas = []; // iterate through each module and push the sagas and reducers of each module in thier respective array

  moduleNames.forEach(function (moduleName) {
    var module = modules[moduleName];

    _moduleRegistry["default"].register(moduleName, module);

    sagas = sagas.concat(module.sagas);
    var moduleReducer = (0, _getReducer["default"])(module.mutations, module.state);
    if (module.decorateReducer) moduleReducer = module.decorateReducer(moduleReducer);
    reducerList[moduleName] = moduleReducer;
  });
  sagas = config.sagas ? sagas.concat(config.sagas) : sagas;
  var combinedReducer = (0, _redux.combineReducers)(reducerList);

  if (config.decorateReducer) {
    combinedReducer = config.decorateReducer(combinedReducer);
  }

  var preloadedState = config.preloadedState || {};
  var composer = (0, _composeEnhancers["default"])(config); // initialize the store using preloaded state, reducers and middlewares

  var store = (0, _redux.createStore)(combinedReducer, preloadedState, composer(_redux.applyMiddleware.apply(void 0, _toConsumableArray(middlewares)))); // rootsaga

  function rootSaga() {
    return regeneratorRuntime.wrap(function rootSaga$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return (0, _effects.all)(sagas);

          case 3:
            _context.next = 8;
            break;

          case 5:
            _context.prev = 5;
            _context.t0 = _context["catch"](0);
            console.error('[ERROR] Something went wrong in rootSaga: ', _context.t0);

          case 8:
          case "end":
            return _context.stop();
        }
      }
    }, _marked, null, [[0, 5]]);
  }

  sagaMiddleware.run(rootSaga);
  return store;
}

var _default = createStore;
exports["default"] = _default;