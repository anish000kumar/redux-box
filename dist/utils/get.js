"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = get;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/* eslint-disable no-param-reassign */
function get(object, keys) {
  var defaultVal = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

  if (_typeof(object) !== 'object') {
    return defaultVal;
  }

  keys = Array.isArray(keys) ? keys : keys.split('.');
  object = object[keys[0]];

  if (object && keys.length > 1) {
    return get(object, keys.slice(1), defaultVal);
  }

  return object === undefined ? defaultVal : object;
}