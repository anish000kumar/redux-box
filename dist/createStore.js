"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createStore;

var _composeEnhancers = require("./composeEnhancers");

var _composeEnhancers2 = _interopRequireDefault(_composeEnhancers);

var _reduxSaga = require("redux-saga");

var _reduxSaga2 = _interopRequireDefault(_reduxSaga);

var _effects = require("redux-saga/effects");

var _reducer = require("./reducer");

var _reducer2 = _interopRequireDefault(_reducer);

var _redux = require("redux");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/*
Iterate through each module and keep stacking our reducers 
and sagas in their respective arrays. Finally 
we use these arrays to initialize the store using 
'createStore' from redux.
*/
function createStore(modules) {
  var _marked = /*#__PURE__*/regeneratorRuntime.mark(rootSaga);

  var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


  //Initialize middleware array
  var sagaMiddleware = (0, _reduxSaga2.default)();
  var middlewares = [sagaMiddleware];

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
  var composeRedux = (0, _composeEnhancers2.default)(config);
  //initialize the store using preloaded state, reducers and middlewares
  var store = (0, _redux.createStore)(combinedReducer, preloadedState, composeRedux(_redux.applyMiddleware.apply(undefined, _toConsumableArray(middlewares))));

  // Default configuration for sagas
  var sagaConfig = Object.assign({}, {
    retryDelay: 2000,
    onError: function onError(err) {}
  }, config.sagaConfig);

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

            sagaConfig.onError(_context.t0);
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