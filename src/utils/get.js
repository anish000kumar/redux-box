/* eslint-disable no-param-reassign */

/**
 * Safely reads a deeply nested value from an object using a dot-separated path
 * (or an array of keys). If any segment of the path is missing, `defaultVal`
 * is returned instead of throwing.
 *
 * @example
 * import get from 'redux-box/dist/utils/get';
 *
 * const state = { user: { profile: { name: 'Anish' } } };
 *
 * get(state, 'user.profile.name');           // => 'Anish'
 * get(state, ['user', 'profile', 'name']);   // => 'Anish'
 * get(state, 'user.profile.age', 0);         // => 0 (missing key, default returned)
 * get(state, 'user.address.city', null);     // => null
 *
 * @param {Object} object - Source object to read from. Non-objects return `defaultVal`.
 * @param {String|String[]} keys - Dot-separated path (e.g. `"a.b.c"`) or an array of keys.
 * @param {*} [defaultVal] - Value returned when the path resolves to `undefined`.
 * @returns {*} The resolved value, or `defaultVal` if the path could not be resolved.
 */
function get(object, keys, defaultVal = undefined) {
  if (typeof object !== 'object') {
    return defaultVal;
  }
  keys = Array.isArray(keys) ? keys : keys.split('.');
  object = object[keys[0]];
  if (object && keys.length > 1) {
    return get(object, keys.slice(1), defaultVal);
  }
  return object === undefined ? defaultVal : object;
}

export default get;
