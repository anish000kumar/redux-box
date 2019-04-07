import moduleRegistry from './moduleRegistry';
import { createSelector } from 'reselect';

export function randomStr() {
  return Math.random()
    .toString(36)
    .substr(2, 9);
}

/**
 *
 * @param {Module} moduleObj - Module object
 * @returns {Object}
 */
export default function createModule(moduleObj) {
  const id = `${randomStr()}${randomStr()}`;
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
