"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = get;

function get(object, keys) {
  let defaultVal = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
  keys = Array.isArray(keys) ? keys : keys.split('.');
  object = object[keys[0]];

  if (object && keys.length > 1) {
    return getProp(object, keys.slice(1), defaultVal);
  }

  return object === undefined ? defaultVal : object;
}