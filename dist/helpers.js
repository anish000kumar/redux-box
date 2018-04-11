"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var using = exports.using = function using() {
  var str = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";

  if (str.length > 0) return str.split(",").map(function (item) {
    return item.trim();
  });else return [];
};

var RX_CAPS = /(?!^)([A-Z])/g;
var isArr = function isArr(data) {
  return Object.prototype.toString.call(data) == "[object Array]";
};
var toSnakeCase = function toSnakeCase(s) {
  return s.replace(/\.?([A-Z])/g, function (x, y) {
    return "_" + y.toLowerCase();
  }).replace(/^_/, "").toUpperCase();
};

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
        if (args.length > 0) {
          args.forEach(function (arg, i) {
            return action[value[i]] = arg;
          });
        }
        return action;
      };
    }
  });

  return finalObj;
};

var pluck = exports.pluck = function pluck(obj, keys) {
  var finalObj = {};
  keys = keys.map(function (key) {
    return key.trim();
  });
  Object.keys(obj).forEach(function (key) {
    key = key.trim();
    if (keys.includes(key)) finalObj[key] = obj[key];
  });
  return finalObj;
};

var Shallowdiffers = function Shallowdiffers(a, b) {
  for (var i in a) {
    if (!(i in b)) return true;
  }for (var _i in b) {
    if (a[_i] !== b[_i]) return true;
  }return false;
};

var doubleDiffers = function doubleDiffers(a, b) {
  for (var i in a) {
    if (!(i in b)) return true;
  }for (var _i2 in b) {
    if (_typeof(a[_i2]) == 'object' && _typeof(b[_i2]) == 'object') {
      if (Shallowdiffers(a[_i2], b[_i2])) return true;
    } else if (a[_i2] !== b[_i2]) return true;
  }
  return false;
};

var areSame = exports.areSame = function areSame(a, b) {
  var x = doubleDiffers(a, b);
  return !x;
};

/*
	utility to reset the state of any module 
	(to it's default  state)
 */
var resetModules = exports.resetModules = function resetModules(dispatch) {
  return function () {
    var modules = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    for (var i = 0; i < modules.length; i++) {
      var module = modules[i];
      dispatch({
        type: module.name + "__RESET__"
      });
    }
  };
};