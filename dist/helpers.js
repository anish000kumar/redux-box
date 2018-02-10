'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createActions = exports.using = undefined;

var _ramda = require('ramda');

var using = exports.using = function using(str) {
  return str.split(',').map(function (item) {
    return item.trim();
  });
};
var RX_CAPS = /(?!^)([A-Z])/g;
var isArr = function isArr(data) {
  return Object.prototype.toString.call(data) == '[object Array]';
};

var toSnakeCase = (0, _ramda.pipe)((0, _ramda.replace)(RX_CAPS, '_$1'), _ramda.toUpper);

var createActions = exports.createActions = function createActions(list) {
  var finalObj = list;
  Object.keys(list).forEach(function (key) {
    var value = list[key];
    if (isArr(value)) {
      finalObj[key] = function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        var action = { type: toSnakeCase(key) };
        args.forEach(function (arg, i) {
          return action[value[i]] = arg;
        });
        return action;
      };
    }
  });

  return finalObj;
};