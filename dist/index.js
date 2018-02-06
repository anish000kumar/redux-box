"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.connectStore = exports.createSagas = exports.createContainer = exports.commit = exports.createStore = exports.STORE = undefined;

var _babelPolyfill = require('babel-polyfill');

var _babelPolyfill2 = _interopRequireDefault(_babelPolyfill);

var _immer = require('immer');

var _immer2 = _interopRequireDefault(_immer);

var _reactRedux = require('react-redux');

var _redux = require('redux');

var _reduxSaga = require('redux-saga');

var _reduxSaga2 = _interopRequireDefault(_reduxSaga);

var _effects = require('redux-saga/effects');

var _reducer = require('./reducer');

var _reducer2 = _interopRequireDefault(_reducer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var devTools = window && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
var composeEnhancers = devTools || _redux.compose;

var sagaMiddleware = (0, _reduxSaga2.default)();
var middlewares = [sagaMiddleware];

var STORE = exports.STORE = null;

//config = {reducers:{}, sagas:[], middlewares}
var createStore = exports.createStore = function createStore(modules, config) {
	var _marked = /*#__PURE__*/regeneratorRuntime.mark(rootSaga);

	if (config && config.middlewares && config.middlewares.length > 0) {
		middlewares = middlewares.concat(config.middlewares);
	}
	var reducerList = Object.assign({}, config.reducers);
	var sagas = [];
	modules.forEach(function (module) {
		sagas = sagas.concat(module.sagas);
		var moduleReducer = (0, _reducer2.default)(module.mutations, module.state);
		if (module.decorateReducer) {
			moduleReducer = module.decorateReducer(moduleReducer);
		}
		reducerList[module.name] = moduleReducer;
	});
	config.sagas && config.sagas.forEach(function (saga) {
		return sagas.concat(saga);
	});

	var combinedReducer = (0, _redux.combineReducers)(reducerList);
	if (config.decorateReducer) {
		combinedReducer = config.decorateReducer(combinedReducer);
	}
	var store = (0, _redux.createStore)(combinedReducer, composeEnhancers(_redux.applyMiddleware.apply(undefined, _toConsumableArray(middlewares))));
	function rootSaga() {
		return regeneratorRuntime.wrap(function rootSaga$(_context) {
			while (1) {
				switch (_context.prev = _context.next) {
					case 0:
						_context.prev = 0;
						_context.next = 3;
						return (0, _effects.all)(sagas);

					case 3:
						_context.next = 9;
						break;

					case 5:
						_context.prev = 5;
						_context.t0 = _context['catch'](0);

						alert('Something went wrong! Please check your connectivity');
						process.env.NODE_ENV == 'development' && console.log(_context.t0);

					case 9:
					case 'end':
						return _context.stop();
				}
			}
		}, _marked, this, [[0, 5]]);
	}
	sagaMiddleware.run(rootSaga);
	exports.STORE = STORE = store;
	return store;
};

var commit = exports.commit = function commit(action_name, data) {
	return STORE.dispatch({
		type: action_name,
		data: data
	});
};

var dispatch = function dispatch(action) {
	return STORE.dispatch(action);
};

var commitAsync = function commitAsync(action_name, data) {
	return new Promise(function (resolve, reject) {
		STORE.dispatch({
			type: action_name,
			data: data,
			resolve: resolve,
			reject: reject
		});
	});
};

var dispatchPromise = function dispatchPromise(action) {
	return new Promise(function (resolve, reject) {
		STORE.dispatch(object.assign({}, action, {
			resolve: resolve,
			reject: reject
		}));
	});
};

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
	var set = function set(target, value) {
		STORE.dispatch({
			type: '__SET__' + module.name,
			data: {
				target: target,
				value: value
			}
		});
	};
	var Container = function Container(props) {
		return props.children(Object.assign({}, props, {
			dispatch: dispatch,
			commit: commit,
			set: set,
			dispatchPromise: dispatchPromise,
			commitAsync: commitAsync
		}));
	};
	return (0, _reactRedux.connect)(mapStateToProps, module.actions || {})(Container);
};

var createSagas = exports.createSagas = function createSagas(saga_list) {
	var arr = [];
	var GeneratorFunction = Object.getPrototypeOf( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
		return regeneratorRuntime.wrap(function _callee$(_context2) {
			while (1) {
				switch (_context2.prev = _context2.next) {
					case 0:
					case 'end':
						return _context2.stop();
				}
			}
		}, _callee, this);
	})).constructor;
	var saga_keys = Object.keys(saga_list);
	saga_keys.forEach(function (key) {
		var action = key.split('.')[0];
		var worker_saga = saga_list[key];
		var mode = key.split('.')[1] || 'latest';
		var watcher = null;
		if (mode == 'latest') {
			watcher = /*#__PURE__*/regeneratorRuntime.mark(function watcher() {
				return regeneratorRuntime.wrap(function watcher$(_context3) {
					while (1) {
						switch (_context3.prev = _context3.next) {
							case 0:
								_context3.next = 2;
								return (0, _effects.takeLatest)(action, worker_saga);

							case 2:
							case 'end':
								return _context3.stop();
						}
					}
				}, watcher, this);
			});
		} else if (mode == 'every') {
			watcher = /*#__PURE__*/regeneratorRuntime.mark(function watcher() {
				return regeneratorRuntime.wrap(function watcher$(_context4) {
					while (1) {
						switch (_context4.prev = _context4.next) {
							case 0:
								_context4.next = 2;
								return (0, _effects.takeEvery)(action, worker_saga);

							case 2:
							case 'end':
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

var connectStore = exports.connectStore = function connectStore(modules) {
	var mapStateToProps = function mapStateToProps(state) {
		var finalState = {};
		Object.keys(modules).forEach(function (key) {
			var module = modules[key];
			finalState[key] = state[module.name];
		});
		return finalState;
	};

	var mapDispatchToProps = function mapDispatchToProps(dispatch) {
		var finalProps = {};
		Object.keys(modules).forEach(function (key) {
			var module = modules[key];
			var module_actions = {};
			if (module.actions) {
				Object.keys(module.actions).forEach(function (action_key) {
					var action = module.actions[action_key];
					module_actions[action_key] = function () {
						return dispatch(action.apply(undefined, arguments));
					};
				});
				finalProps[key] = module_actions;
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
		return Object.assign({}, finalModule, {
			commit: commit,
			commitAsync: commitAsync,
			dispatch: dispatch,
			dispatchPromise: dispatchPromise
		}, ownProps);
	};

	return (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps, mergeProps);
};

exports.default = {
	createContainer: createContainer,
	createSagas: createSagas,
	createStore: createStore,
	connectStore: connectStore
};