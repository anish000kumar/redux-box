"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports["default"] = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _reduxSaga = _interopRequireDefault(require("redux-saga"));
var _effects = require("redux-saga/effects");
var _redux = require("redux");
var _get = _interopRequireDefault(require("./utils/get"));
var _composeEnhancers = _interopRequireDefault(require("./composeEnhancers"));
var _moduleRegistry = _interopRequireDefault(require("./moduleRegistry"));
var _getReducer = _interopRequireDefault(require("./getReducer"));
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
function createStore(modules, config) {
  var _marked = /*#__PURE__*/_regenerator["default"].mark(rootSaga);
  if (config === void 0) {
    config = {};
  }
  //  Array containing names of all registered modules
  var moduleNames = Object.keys(modules);

  // Initialize the middleware array
  var sagaMiddleware = (0, _reduxSaga["default"])();
  var middlewares = [sagaMiddleware];

  // push the provided middlewares in config object, to the middleware array
  if ((0, _get["default"])(config, 'middlewares.length', 0) > 0) {
    middlewares = middlewares.concat(config.middlewares);
  }

  // an object containing reducers for all modules, to  be fed to combineReducer
  var reducerList = Object.assign({}, config.reducers);
  var sagas = [];

  // iterate through each module and push the sagas and reducers of each module in thier respective array
  moduleNames.forEach(function (moduleName) {
    var module = modules[moduleName];
    _moduleRegistry["default"].register(moduleName, module);
    sagas = sagas.concat(module.sagas || []);
    var moduleReducer = (0, _getReducer["default"])(module.mutations || {}, module.state);
    if (module.decorateReducer) moduleReducer = module.decorateReducer(moduleReducer);
    reducerList[moduleName] = moduleReducer;
  });
  sagas = config.sagas ? sagas.concat(config.sagas) : sagas;

  // Modules built with `createSagas` ship watcher *factories* (zero-arg
  // functions returning a fresh generator). Plain generator instances
  // are still accepted for backwards-compatibility and for callers that
  // build their own watchers. Calling the factories here means each
  // `createStore` invocation gets its own brand-new generators, which is
  // essential when the same module objects are reused across multiple
  // stores - e.g. in tests that spin a fresh store per case.
  sagas = sagas.map(function (s) {
    return typeof s === 'function' ? s() : s;
  });
  var combinedReducer = (0, _redux.combineReducers)(reducerList);
  if (config.decorateReducer) {
    combinedReducer = config.decorateReducer(combinedReducer);
  }
  var preloadedState = config.preloadedState || {};
  var composer = (0, _composeEnhancers["default"])(config);
  // initialize the store using preloaded state, reducers and middlewares
  var store = (0, _redux.createStore)(combinedReducer, preloadedState, composer(_redux.applyMiddleware.apply(void 0, middlewares)));

  // rootsaga
  function rootSaga() {
    var _t;
    return _regenerator["default"].wrap(function (_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 1;
          return (0, _effects.all)(sagas);
        case 1:
          _context.next = 3;
          break;
        case 2:
          _context.prev = 2;
          _t = _context["catch"](0);
          console.error('[ERROR] Something went wrong in rootSaga: ', _t);
        case 3:
        case "end":
          return _context.stop();
      }
    }, _marked, null, [[0, 2]]);
  }
  sagaMiddleware.run(rootSaga);
  return store;
}
var _default = exports["default"] = createStore;