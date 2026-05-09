"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports["default"] = void 0;
exports.generateId = generateId;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _reselect = require("reselect");
var _dynamicSelector = _interopRequireDefault(require("./dynamicSelector"));
var _moduleRegistry = _interopRequireDefault(require("./moduleRegistry"));
/**
 * Generates an RFC4122-style v4 UUID. Used internally by {@link createModule}
 * to give every module a stable, unique id so it can be looked up in the
 * module registry regardless of the key it was mounted under in the store.
 *
 * @returns {String} A new UUID, e.g. `"3b1f0c64-0b2e-4a3f-8e65-7b6a8b4d9f10"`.
 */
function generateId() {
  var RFC4122_TEMPLATE = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
  return RFC4122_TEMPLATE.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
      v = c == 'x' ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });
}

/**
 * Wraps a plain module definition (state, mutations, sagas, selectors,
 * dispatchers) into a redux-box module. The returned object has a unique
 * `id` and a few helpers (`getName`, `getSelector`, `select`) that let
 * selectors and components reference the module without hard-coding the
 * key it was mounted under in the store.
 *
 * @example
 * // modules/user/index.js
 * import { createModule } from 'redux-box';
 * import * as mutations from './mutations';
 * import * as sagas from './sagas';
 * import * as selectors from './selectors';
 * import * as dispatchers from './dispatchers';
 *
 * export default createModule({
 *   name: 'user',
 *   state: { id: null, name: '' },
 *   mutations,
 *   sagas,
 *   selectors,
 *   dispatchers,
 * });
 *
 * @example
 * // Using the `select` helper to build a memoized selector
 * // that is independent of the key the module was mounted under.
 * const getUserName = userModule.select(user => user.name);
 *
 * @param {Module} moduleObj - Plain module definition (see {@link Module}).
 * @returns {Object} The decorated module. In addition to the original keys it exposes:
 *   - `id` {String} - unique id assigned to this module.
 *   - `getName()` {Function} - returns the key the module was registered under in the store.
 *   - `getSelector()` {Function} - returns a `(state) => moduleState` selector.
 *   - `select(fn)` {Function} - builds a memoized reselect selector over the module state.
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
        return finalObj.__name && state ? state[finalObj.__name] : null;
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
var _default = exports["default"] = createModule;