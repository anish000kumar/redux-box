import moduleRegistry from './moduleRegistry';

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
  return {
    ...moduleObj,
    id,
    getName() {
      return moduleRegistry.getName(id);
    },
    getSelector() {
      const moduleName = moduleRegistry.getName(id);
      return function(state) {
        return moduleName ? state[moduleName] : null;
      };
    },
  };
}
