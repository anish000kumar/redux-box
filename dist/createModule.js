"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateId = generateId;
exports["default"] = createModule;

var _reselect = require("reselect");

var _moduleRegistry = _interopRequireDefault(require("./moduleRegistry"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function generateId() {
  var RFC4122_TEMPLATE = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
  return RFC4122_TEMPLATE.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });
}
/**
 *
 * @param {Module} moduleObj - Module object
 * @returns {Object}
 */


function createModule(moduleObj) {
  var id = "".concat(generateId());

  var finalObj = _objectSpread({}, moduleObj, {
    id: id,
    getName: function getName() {
      return _moduleRegistry["default"].getName(id);
    },
    getSelector: function getSelector() {
      return function (state) {
        if (!finalObj.__name) {
          finalObj.__name = _moduleRegistry["default"].getName(id);
        }

        return finalObj.__name ? state[finalObj.__name] : null;
      };
    },
    select: function select(cb) {
      var getModuleState = finalObj.getSelector();
      return (0, _reselect.createSelector)(getModuleState, cb);
    }
  });

  return finalObj;
}