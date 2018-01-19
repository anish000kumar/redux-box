'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.createSagas = exports.createContainer = undefined;

var _reactRedux = require('react-redux');

var _effects = require('redux-saga/effects');

var _index = require('./index');

var createContainer = exports.createContainer = function createContainer(module) {
	var mapStateToProps = function mapStateToProps(state) {
		return state[module.name];
	};
	var set = function set(target, value) {
		_index.STORE.dispatch({
			type: module.name + '__SET',
			data: {
				target: target,
				value: value
			}
		});
	};
	var Container = function Container(props) {
		return props.children(Object.assign({}, props, {
			dispatch: _index.dispatch,
			commit: _index.commit,
			set: set
		}));
	};
	return (0, _reactRedux.connect)(mapStateToProps, {})(Container);
};

var createSagas = exports.createSagas = function createSagas(saga_list) {
	var arr = [];
	var GeneratorFunction = Object.getPrototypeOf( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
		return regeneratorRuntime.wrap(function _callee$(_context) {
			while (1) {
				switch (_context.prev = _context.next) {
					case 0:
					case 'end':
						return _context.stop();
				}
			}
		}, _callee, this);
	})).constructor;
	var saga_keys = Object.keys(saga_list);
	saga_keys.forEach(function (key) {
		var action = key.split('.')[0];
		var worker_saga = saga_list[key];
		var mode = key.split('.')[1];
		var watcher = null;
		if (mode == 'latest') {
			watcher = /*#__PURE__*/regeneratorRuntime.mark(function watcher() {
				return regeneratorRuntime.wrap(function watcher$(_context2) {
					while (1) {
						switch (_context2.prev = _context2.next) {
							case 0:
								_context2.next = 2;
								return (0, _effects.takeLatest)(action, worker_saga);

							case 2:
							case 'end':
								return _context2.stop();
						}
					}
				}, watcher, this);
			});
		} else if (mode == 'every') {
			watcher = /*#__PURE__*/regeneratorRuntime.mark(function watcher() {
				return regeneratorRuntime.wrap(function watcher$(_context3) {
					while (1) {
						switch (_context3.prev = _context3.next) {
							case 0:
								_context3.next = 2;
								return (0, _effects.takeEvery)(action, worker_saga);

							case 2:
							case 'end':
								return _context3.stop();
						}
					}
				}, watcher, this);
			});
		}
		arr.push(watcher());
	});
	return arr;
};