import { createSelector } from 'reselect';
import moduleRegistry from './moduleRegistry';

export function generateId() {
  const RFC4122_TEMPLATE = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
  return RFC4122_TEMPLATE.replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 *
 * @param {Module} moduleObj - Module object
 * @returns {Object}
 */
export default function createModule(moduleObj) {
  const id = `${generateId()}`;
  const finalObj = {
    ...moduleObj,
    id,
    getName() {
      return moduleRegistry.getName(id);
    },
    getSelector() {
      return function(state) {
        if (!finalObj.__name) {
          finalObj.__name = moduleRegistry.getName(id);
        }
        return finalObj.__name ? state[finalObj.__name] : null;
      };
    },
    select(cb) {
      const getModuleState = finalObj.getSelector();
      return createSelector(
        getModuleState,
        cb
      );
    },
  };

  return finalObj;
}
