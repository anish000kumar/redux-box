import composeEnhancers from './composeEnhancers';
import createSagaMiddleware from 'redux-saga';
import createSagas from './createSagas';
import { all } from 'redux-saga/effects';
import getReducer from './getReducer';
import {
  applyMiddleware,
  combineReducers,
  createStore as storeCreator,
} from 'redux';
import get from './utils/get';

/**
 * Creates redux store
 *
 * @typedef {Function} Selector - Selector function
 * @typedef {String} ModuleName - Name of redux-box module
 * @typedef {Object} Module - Object representing module
 * @typedef {Object={}} Module.state - Initial state for the module
 * @typedef {Object<String, Function>={}} Module.dispatchers - Action dispatchers for the module
 * @typedef {Object<String, Generator>={}} Module.sagas - Sagas for the module
 * @typedef {Object<String, Function>={}} Module.mutations - Mutations for the module
 * @typedef {Object<String, Selector>={}} Module.selectors - Selector for the module
 * @typedef {Function} Reducer - Reducer function
 * @param {Object<ModuleName, Module>} modulesObj - Object containing all modules to be attached to store
 * @param {Object={}} config - Contains additional configuration for store
 * @param {Function[]=[]} config.middlewares - Array of middlewares to be used in store
 * @param {Object<String, Reducer>={}} config.reducers - Object containing reducers to be used in store
 * @param {Generator[]=[]} config.sagas - Array of watcher sagas to be used in store
 * @param {Object=} config.preloadedState - Preloaded state for store
 * @param {Function=} config.decorateReducer - decorator function for reducer formed by redux-box, has formed reducer as first argument
 * @returns {Object} store
 */
export default function createStore(modulesObj, config = {}) {
  //  Array containing names of all registered modules
  const moduleNames = Object.keys(modulesObj);
  // Initialize the middleware array

  const sagaMiddleware = createSagaMiddleware();
  let middlewares = [sagaMiddleware];

  // push the provided middlewares in config object, to the middleware array
  if (get(config, 'middlewares.length', 0) > 0) {
    middlewares = middlewares.concat(config.middlewares);
  }

  // an object containing reducers for all modules, to  be fed to combineReducer
  let reducerList = Object.assign({}, config.reducers);
  let sagas = [];

  // iterate through each module and push the sagas and reducers of each module in thier respective array
  moduleNames.forEach(moduleName => {
    const module = modulesObj[moduleName];
    sagas = sagas.concat(createSagas(module.sagas));
    let moduleReducer = getReducer(module.mutations, module.state);

    if (module.decorateReducer)
      moduleReducer = module.decorateReducer(moduleReducer);
    reducerList[moduleName] = moduleReducer;
  });

  sagas = config.sagas ? sagas.concat(config.sagas) : sagas;

  let combinedReducer = combineReducers(reducerList);
  if (config.decorateReducer) {
    combinedReducer = config.decorateReducer(combinedReducer);
  }
  let preloadedState = config.preloadedState || {};
  let composer = composeEnhancers(config);
  //initialize the store using preloaded state, reducers and middlewares
  let store = storeCreator(
    combinedReducer,
    preloadedState,
    composer(applyMiddleware(...middlewares))
  );

  // rootsaga
  function* rootSaga() {
    while (true) {
      try {
        yield all(sagas);
      } catch (err) {
        console.error('[ERROR] Something went wrong in rootSaga: ', err);
      }
    }
  }

  sagaMiddleware.run(rootSaga);
  return store;
}
