"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DYNAMIC_SELECTOR = void 0;
exports["default"] = dynamicSelector;

var DYNAMIC_SELECTOR = '__reduxBoxDynamicSelector';
exports.DYNAMIC_SELECTOR = DYNAMIC_SELECTOR;

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
