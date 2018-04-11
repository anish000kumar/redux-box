"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resetModules = exports.using = exports.createActions = exports.moduleToReducer = exports.connectStore = exports.createSagas = exports.createContainer = exports.createStore = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _immer = require("immer");

var _immer2 = _interopRequireDefault(_immer);

var _reactRedux = require("react-redux");

var _redux = require("redux");

var _reduxSaga = require("redux-saga");

var _reduxSaga2 = _interopRequireDefault(_reduxSaga);

var _effects = require("redux-saga/effects");

var _reducer = require("./reducer");

var _reducer2 = _interopRequireDefault(_reducer);

require("regenerator-runtime/runtime");

var _helpers = require("./helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/*
detect the environment to decide whether or not to plug in dev tools. 
In react process.env.NODE_ENV refelcts the environment
while in react-native __DEV__ flag reflects the same
*/
var devTools = (typeof window === "undefined" ? "undefined" : _typeof(window)) === "object" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
var devMode = typeof __DEV__ === "boolean" && __DEV__ || (typeof process === "undefined" ? "undefined" : _typeof(process)) == "object" && process.env && process.env.NODE_ENV && process.env.NODE_ENV === "development";

/*
Initialize the middleware array and finalize the compose function 
based on current environment
*/
var composeEnhancers = devMode ? devTools || _redux.compose : _redux.compose;
var sagaMiddleware = (0, _reduxSaga2.default)();
var middlewares = [sagaMiddleware];

/*
In this method, we iterate through each module and keep stacking
our reducers and sagas in their respective arrays. Finally 
we use these arrays to initialize the store using 
'createStore' from redux.
*/
var createStore = exports.createStore = function createStore(modules) {
  var _marked = /*#__PURE__*/regeneratorRuntime.mark(rootSaga);

  var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  //push the provided middlewares in config object, to the middleware array
  if (config && config.middlewares && config.middlewares.length > 0) {
    middlewares = middlewares.concat(config.middlewares);
  }
  var reducerList = Object.assign({}, config.reducers);
  var sagas = [];

  //iterate through each module and push the sagas and reducers of each module in thier respective array
  modules.forEach(function (module) {
    sagas = sagas.concat(module.sagas);
    var moduleReducer = (0, _reducer2.default)(module.mutations, module.state, module.name);
    if (module.decorateReducer) moduleReducer = module.decorateReducer(moduleReducer);
    reducerList[module.name] = moduleReducer;
  });
  config.sagas && config.sagas.forEach(function (saga) {
    return sagas.concat(saga);
  });

  var combinedReducer = (0, _redux.combineReducers)(reducerList);
  if (config.decorateReducer) {
    combinedReducer = config.decorateReducer(combinedReducer);
  }
  var preloadedState = config.preloadedState || {};

  //initialize the store using preloaded state, reducers and middlewares
  var store = (0, _redux.createStore)(combinedReducer, preloadedState, composeEnhancers(_redux.applyMiddleware.apply(undefined, _toConsumableArray(middlewares))));

  // default sagConfig, overwrite it with any provided
  // values and initialize the rootsaga
  var sagaCofig = Object.assign({}, {
    retryDelay: 2000,
    onError: function onError(err) {}
  }, config.sagaCofig);

  function rootSaga() {
    return regeneratorRuntime.wrap(function rootSaga$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!true) {
              _context.next = 13;
              break;
            }

            _context.prev = 1;
            _context.next = 4;
            return (0, _effects.all)(sagas);

          case 4:
            _context.next = 11;
            break;

          case 6:
            _context.prev = 6;
            _context.t0 = _context["catch"](1);

            sagaCofig.onError(_context.t0);
            _context.next = 11;
            return (0, _effects.call)(_reduxSaga.delay, sagaConfig.retryDelay);

          case 11:
            _context.next = 0;
            break;

          case 13:
          case "end":
            return _context.stop();
        }
      }
    }, _marked, this, [[1, 6]]);
  }
  sagaMiddleware.run(rootSaga);
  return store;
};

/*
	utility to access the store using render function
*/
var createContainer = exports.createContainer = function createContainer(module) {
  var mapStateToProps = function mapStateToProps(state) {
    return state[module.name];
  };
  var mapDispatchToProps = function mapDispatchToProps(dispatch) {
    return Object.keys(module.actions).map(function (key) {
      var action = module.actions[key];
      return dispatch(action());
    });
  };

  var Container = function Container(props) {
    return props.children(props);
  };
  return (0, _reactRedux.connect)(mapStateToProps, module.actions || {})(Container);
};

/*
	Syntactic sugar for easily accessing sagas
*/
var createSagas = exports.createSagas = function createSagas(saga_list) {
  var arr = [];
  var GeneratorFunction = Object.getPrototypeOf( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    return regeneratorRuntime.wrap(function _callee$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee, this);
  })).constructor;
  var saga_keys = Object.keys(saga_list);
  saga_keys.forEach(function (key) {
    var action = key.split(".")[0];
    var worker_saga = saga_list[key];
    var mode = key.split(".")[1] || "latest";
    var watcher = null;
    if (mode == "latest") {
      watcher = /*#__PURE__*/regeneratorRuntime.mark(function watcher() {
        return regeneratorRuntime.wrap(function watcher$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return (0, _effects.takeLatest)(action, worker_saga);

              case 2:
              case "end":
                return _context3.stop();
            }
          }
        }, watcher, this);
      });
    } else if (mode == "every") {
      watcher = /*#__PURE__*/regeneratorRuntime.mark(function watcher() {
        return regeneratorRuntime.wrap(function watcher$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return (0, _effects.takeEvery)(action, worker_saga);

              case 2:
              case "end":
                return _context4.stop();
            }
          }
        }, watcher, this);
      });
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
var connectStore = exports.connectStore = function connectStore(modules) {
  var mapStateToProps = function mapStateToProps(state) {
    var finalState = {};
    Object.keys(modules).forEach(function (key) {
      var moduleInstance = modules[key];
      var module_name = moduleInstance.module && moduleInstance.module.name || moduleInstance.name;
      var stateObj = state[module_name];
      if (moduleInstance.get) {
        var filter_array = moduleInstance.get.split(",");
        stateObj = (0, _helpers.pluck)(stateObj, filter_array);
      }
      finalState[key] = stateObj;
    });
    return finalState;
  };
  var mapDispatchToProps = function mapDispatchToProps(dispatch) {
    var finalProps = {};
    Object.keys(modules).forEach(function (key) {
      var moduleInstance = modules[key];
      var actions_obj = {};
      var module_actions = moduleInstance.module && moduleInstance.module.actions || moduleInstance.actions;
      if (module_actions) {
        Object.keys(module_actions).forEach(function (action_key) {
          var action = module_actions[action_key];
          actions_obj[action_key] = function () {
            return dispatch(action.apply(undefined, arguments));
          };
        });
        finalProps[key] = actions_obj;
      }
    });
    return finalProps;
  };
  var mergeProps = function mergeProps(state, actions, ownProps) {
    var finalModule = {};
    Object.keys(state).forEach(function (key) {
      var module_state = state[key];
      var module_actions = actions[key];
      finalModule[key] = Object.assign({}, module_state, module_actions);
    });
    return Object.assign({}, finalModule, ownProps);
  };
  return (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps, mergeProps, {
    pure: true,
    areStatePropsEqual: function areStatePropsEqual(a, b) {
      return (0, _helpers.areSame)(a, b);
    }
  });
};

// Export helpers
var moduleToReducer = exports.moduleToReducer = function moduleToReducer(module) {
  return (0, _reducer2.default)(module.mutations, module.state);
};
var createActions = exports.createActions = _helpers.createActions;
var using = exports.using = _helpers.using;
var resetModules = exports.resetModules = _helpers.resetModules;

// default exports
exports.default = {
  createContainer: createContainer,
  createSagas: createSagas,
  moduleToReducer: moduleToReducer,
  createStore: createStore,
  connectStore: connectStore
};