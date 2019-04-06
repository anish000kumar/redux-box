"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "createStore", {
  enumerable: true,
  get: function get() {
    return _createStore.default;
  }
});
Object.defineProperty(exports, "connectStore", {
  enumerable: true,
  get: function get() {
    return _connectStore.default;
  }
});

var _createStore = _interopRequireDefault(require("./createStore"));

var _connectStore = _interopRequireDefault(require("./connectStore"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }