"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.moduleToReducer = exports.resetModules = exports.createStore = exports.createSagas = exports.createContainer = exports.connectStore = exports.using = exports.createActions = undefined;

var _helpers = require("./helpers");

Object.defineProperty(exports, "createActions", {
  enumerable: true,
  get: function get() {
    return _helpers.createActions;
  }
});
Object.defineProperty(exports, "using", {
  enumerable: true,
  get: function get() {
    return _helpers.using;
  }
});

var _connectStore = require("./connectStore");

Object.defineProperty(exports, "connectStore", {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_connectStore).default;
  }
});

var _createContainer = require("./createContainer");

Object.defineProperty(exports, "createContainer", {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_createContainer).default;
  }
});

var _createSagas = require("./createSagas");

Object.defineProperty(exports, "createSagas", {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_createSagas).default;
  }
});

var _createStore = require("./createStore");

Object.defineProperty(exports, "createStore", {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_createStore).default;
  }
});

var _resetModules = require("./resetModules");

Object.defineProperty(exports, "resetModules", {
  enumerable: true,
  get: function get() {
    return _resetModules.resetModules;
  }
});

require("regenerator-runtime/runtime");

var _reducer = require("./reducer");

var _reducer2 = _interopRequireDefault(_reducer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var moduleToReducer = exports.moduleToReducer = function moduleToReducer(module) {
  return (0, _reducer2.default)(module.mutations, module.state);
};