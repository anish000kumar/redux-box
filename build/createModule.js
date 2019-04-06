"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createModule;

var _moduleRegistry = _interopRequireDefault(require("./moduleRegistry"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function randomStr() {
  return Math.random().toString(36).substr(2, 9);
}
/**
 *
 * @param {Module} moduleObj - Module object
 * @returns {Object}
 */


function createModule(moduleObj) {
  const id = "".concat(randomStr()).concat(randomStr());
  return _objectSpread({}, moduleObj, {
    id,

    getSelector() {
      const moduleName = _moduleRegistry.default.getName(id);

      return function (state) {
        return state[moduleName];
      };
    }

  });
}