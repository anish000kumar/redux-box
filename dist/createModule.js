"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports["default"] = createModule;
exports.generateId = generateId;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _reselect = require("reselect");
var _moduleRegistry = _interopRequireDefault(require("./moduleRegistry"));
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
  var id = "" + generateId();
  var finalObj = (0, _extends2["default"])({}, moduleObj, {
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