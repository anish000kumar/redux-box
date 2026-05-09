"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports["default"] = createModule;
exports.generateId = generateId;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _reselect = require("reselect");
var _dynamicSelector = _interopRequireDefault(require("./dynamicSelector"));
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
    },
    dynamicSelect: function dynamicSelect(cb) {
      var getModuleState = finalObj.getSelector();
      return (0, _dynamicSelector["default"])(function (state, props) {
        for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
          args[_key - 2] = arguments[_key];
        }
        return cb.apply(void 0, [getModuleState(state)].concat(args));
      });
    }
  });
  return finalObj;
}