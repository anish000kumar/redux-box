"use strict";

exports.__esModule = true;
exports.DYNAMIC_SELECTOR = void 0;
exports["default"] = dynamicSelector;
var DYNAMIC_SELECTOR = exports.DYNAMIC_SELECTOR = '__reduxBoxDynamicSelector';
/**
 * Marks a selector so connectStore passes it as a callable prop.
 * The selector receives `(state, ownProps, ...args)` when the prop is called.
 *
 * @param {Function} selector - Selector to be evaluated on demand.
 * @returns {Function} Dynamic selector.
 */
function dynamicSelector(selector) {
  if (typeof selector !== 'function') {
    throw new TypeError('dynamicSelector expects a function');
  }
  selector[DYNAMIC_SELECTOR] = true;
  return selector;
}