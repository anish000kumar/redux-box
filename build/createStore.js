"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _reduxSaga = _interopRequireDefault(require("redux-saga"));

var _composeEnhancers = _interopRequireDefault(require("./composeEnhancers"));

var _moduleRegistry = _interopRequireDefault(require("./moduleRegistry"));

var _effects = require("redux-saga/effects");

var _getReducer = _interopRequireDefault(require("./getReducer"));

var _redux = require("redux");

var _get = _interopRequireDefault(require("./utils/get"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
 * createStore([userModule, marketplaceModule],{
 *  enableDevTools() => true
 * })
 *
 * @param {Object} config -  Contains configuration for store
 * @param {Object<String, Module>} config.modules - Object containing all modules to be attached to store
 * @param {Function[]} config.middlewares - Array of middlewares to be used in store
 * @param {Object<String, Function>=} config.reducers - (Optional) Object containing reducers to be used in store
 * @param {Generator[]} config.sagas - Array of watcher sagas to be used in store
 * @param {Object=} config.preloadedState - (Optional) Preloaded state for store
 * @param {Function=} config.decorateReducer - (Optional) decorator function for reducer formed by redux-box, has formed reducer as first argument
 * @returns {Object} store
 */
function createStore() {
  let _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$modules = _ref.modules,
      modules = _ref$modules === void 0 ? {} : _ref$modules;

  //  Array containing names of all registered modules
  const moduleNames = Object.keys(modules); // Initialize the middleware array

  const sagaMiddleware = (0, _reduxSaga.default)();
  let middlewares = [sagaMiddleware]; // push the provided middlewares in config object, to the middleware array

  if ((0, _get.default)(config, 'middlewares.length', 0) > 0) {
    middlewares = middlewares.concat(config.middlewares);
  } // an object containing reducers for all modules, to  be fed to combineReducer


  let reducerList = Object.assign({}, config.reducers);
  let sagas = []; // iterate through each module and push the sagas and reducers of each module in thier respective array

  moduleNames.forEach(moduleName => {
    const module = modules[moduleName];

    _moduleRegistry.default.register(moduleName, module);

    sagas = sagas.concat(module.sagas);
    let moduleReducer = (0, _getReducer.default)(module.mutations, module.state);
    if (module.decorateReducer) moduleReducer = module.decorateReducer(moduleReducer);
    reducerList[moduleName] = moduleReducer;
  });
  sagas = config.sagas ? sagas.concat(config.sagas) : sagas;
  let combinedReducer = (0, _redux.combineReducers)(reducerList);

  if (config.decorateReducer) {
    combinedReducer = config.decorateReducer(combinedReducer);
  }

  let preloadedState = config.preloadedState || {};
  let composer = (0, _composeEnhancers.default)(config); //initialize the store using preloaded state, reducers and middlewares

  let store = (0, _redux.createStore)(combinedReducer, preloadedState, composer((0, _redux.applyMiddleware)(...middlewares))); // rootsaga

  function* rootSaga() {
    while (true) {
      try {
        yield (0, _effects.all)(sagas);
      } catch (err) {
        console.error('[ERROR] Something went wrong in rootSaga: ', err);
      }
    }
  }

  sagaMiddleware.run(rootSaga);
  return store;
}

var _default = createStore;
exports.default = _default;