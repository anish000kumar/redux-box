import { createSelector } from 'reselect';
import dynamicSelector from './dynamicSelector';
import moduleRegistry from './moduleRegistry';

/**
 * Generates an RFC4122-style v4 UUID. Used internally by {@link createModule}
 * to give every module a stable, unique id so it can be looked up in the
 * module registry regardless of the key it was mounted under in the store.
 *
 * @returns {String} A new UUID, e.g. `"3b1f0c64-0b2e-4a3f-8e65-7b6a8b4d9f10"`.
 */
export function generateId() {
  const RFC4122_TEMPLATE = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
  return RFC4122_TEMPLATE.replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
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
    dynamicSelect(cb) {
      const getModuleState = finalObj.getSelector();
      return dynamicSelector((state, props, ...args) =>
        cb(getModuleState(state), ...args)
      );
    },
  };

  return finalObj;
}

export default createModule;
