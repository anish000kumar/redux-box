import _extends from "@babel/runtime/helpers/esm/extends";
import { createSelector } from 'reselect';
import moduleRegistry from './moduleRegistry';
export function generateId() {
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
export default function createModule(moduleObj) {
  var id = "" + generateId();
  var finalObj = _extends({}, moduleObj, {
    id: id,
    getName: function getName() {
      return moduleRegistry.getName(id);
    },
    getSelector: function getSelector() {
      return function (state) {
        if (!finalObj.__name) {
          finalObj.__name = moduleRegistry.getName(id);
        }
        return finalObj.__name ? state[finalObj.__name] : null;
      };
    },
    select: function select(cb) {
      var getModuleState = finalObj.getSelector();
      return createSelector(getModuleState, cb);
    }
  });
  return finalObj;
}