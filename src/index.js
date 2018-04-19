"use strict";
import produce from "immer";
import { connect } from "react-redux";
import {
  applyMiddleware,
  combineReducers,
  compose,
  createStore as storeCreator,
} from "redux";
import createSagaMiddleware, { delay } from "redux-saga";
import { all, takeLatest, takeEvery, put,call } from "redux-saga/effects";
import getReducer from "./reducer";
import "regenerator-runtime/runtime"
import {
  createActions as actionCreators,
  using as arrayHelper,
  pluck,
  areSame,
  resetModules as resetModulesHelper
} from "./helpers";

/*
detect the environment to decide whether or not to plug in dev tools. 
In react process.env.NODE_ENV refelcts the environment
while in react-native __DEV__ flag reflects the same
*/
const devTools =
  typeof window === "object" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
let devMode =
  (typeof __DEV__ === "boolean" && __DEV__) ||
  (typeof process == "object" &&
    process.env &&
    process.env.NODE_ENV &&
    process.env.NODE_ENV === "development");

/*
Initialize the middleware array and finalize the compose function 
based on current environment
*/
const composeEnhancers = devMode ? devTools || compose : compose;
const sagaMiddleware = createSagaMiddleware();
let middlewares = [sagaMiddleware];

/*
In this method, we iterate through each module and keep stacking
our reducers and sagas in their respective arrays. Finally 
we use these arrays to initialize the store using 
'createStore' from redux.
*/
export const createStore = (modules, config = {}) => {
  //push the provided middlewares in config object, to the middleware array
  if (config && config.middlewares && config.middlewares.length > 0) {
    middlewares = middlewares.concat(config.middlewares);
  }
  let reducerList = Object.assign({}, config.reducers);
  let sagas = [];

  //iterate through each module and push the sagas and reducers of each module in thier respective array
  modules.forEach(module => {
    sagas = sagas.concat(module.sagas);
    let moduleReducer = getReducer(module.mutations, module.state, module.name);
    if (module.decorateReducer)
      moduleReducer = module.decorateReducer(moduleReducer);
    reducerList[module.name] = moduleReducer;
  });
  config.sagas && config.sagas.forEach(saga => sagas.concat(saga));

  let combinedReducer = combineReducers(reducerList);
  if (config.decorateReducer) {
    combinedReducer = config.decorateReducer(combinedReducer);
  }
  let preloadedState = config.preloadedState || {};

  //initialize the store using preloaded state, reducers and middlewares
  let store = storeCreator(
    combinedReducer,
    preloadedState,
    composeEnhancers(applyMiddleware(...middlewares))
  );

  // default sagConfig, overwrite it with any provided
  // values and initialize the rootsaga
  const sagaConfig = Object.assign(
    {},
    {
      retryDelay: 2000,
      onError: err => {}
    },
    config.sagaConfig
  );

  function* rootSaga() {
    while (true) {
      try {
        yield all(sagas);
      } catch (err) {
        sagaConfig.onError(err);
        yield call(delay, sagaConfig.retryDelay);
      }
    }
  }
  sagaMiddleware.run(rootSaga);
  return store;
};

/*
	utility to access the store using render function
*/
export const createContainer = module => {
  const mapStateToProps = state => state[module.name];
  const mapDispatchToProps = dispatch => {
    return Object.keys(module.actions).map(key => {
      let action = module.actions[key];
      return dispatch(action());
    });
  };

  const Container = props => props.children(props);
  return connect(mapStateToProps, module.actions || {})(Container);
};

/*
	Syntactic sugar for easily accessing sagas
*/
export const createSagas = saga_list => {
  let arr = [];
  var GeneratorFunction = Object.getPrototypeOf(function*() {}).constructor;
  let saga_keys = Object.keys(saga_list);
  saga_keys.forEach(key => {
    let action = key.split(".")[0];
    let worker_saga = saga_list[key];
    let mode = key.split(".")[1] || "latest";
    let watcher = null;
    if (mode == "latest") {
      watcher = function*() {
        yield takeLatest(action, worker_saga);
      };
    } else if (mode == "every") {
      watcher = function*() {
        yield takeEvery(action, worker_saga);
      };
    }
    arr.push(watcher());
  });
  return arr;
};

/*
	Connect a component to any module
	TODO: namespacing
	TODO: effiecient rerenders
*/
export const connectStore = modules => {
  const mapStateToProps = state => {
    let finalState = {};
    Object.keys(modules).forEach(key => {
      const moduleInstance = modules[key];
      let module_name =
        (moduleInstance.module && moduleInstance.module.name) ||
        moduleInstance.name;
      let stateObj = state[module_name];
      if (moduleInstance.get) {
        let filter_array = moduleInstance.get.split(",");
        stateObj = pluck(stateObj, filter_array);
      }
      finalState[key] = stateObj;
    });
    return finalState;
  };
  const mapDispatchToProps = dispatch => {
    let finalProps = {};
    Object.keys(modules).forEach(key => {
      const moduleInstance = modules[key];
      const actions_obj = {};
      let module_actions =
        (moduleInstance.module && moduleInstance.module.actions) ||
        moduleInstance.actions;
      if (module_actions) {
        Object.keys(module_actions).forEach(action_key => {
          const action = module_actions[action_key];
          actions_obj[action_key] = (...args) => {
            return dispatch(action(...args));
          };
        });
        finalProps[key] = actions_obj;
      }
    });
    return finalProps;
  };
  const mergeProps = (state, actions, ownProps) => {
    let finalModule = {};
    Object.keys(state).forEach(key => {
      let module_state = state[key];
      let module_actions = actions[key];
      finalModule[key] = Object.assign({}, module_state, module_actions);
    });
    return Object.assign({}, finalModule, ownProps);
  };
  return connect(mapStateToProps, mapDispatchToProps, mergeProps, {
    pure: true,
    areStatePropsEqual: (a, b) => areSame(a,b)
  });
};

// Export helpers
export const moduleToReducer = module =>
  getReducer(module.mutations, module.state);
export const createActions = actionCreators;
export const using = arrayHelper;
export const resetModules = resetModulesHelper

// default exports
export default {
  createContainer,
  createSagas,
  moduleToReducer,
  createStore,
  connectStore
};
