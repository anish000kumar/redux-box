export const DYNAMIC_SELECTOR = '__reduxBoxDynamicSelector' as const;

type SelectorWithDynamicFlag<T extends (...args: any[]) => any> = T & {
  [DYNAMIC_SELECTOR]: true;
};

/**
 * Marks a selector so connectStore passes it as a callable prop.
 * The selector receives `(state, ownProps, ...args)` when the prop is called.
 *
 * @param {Function} selector - Selector to be evaluated on demand.
 * @returns {Function} Dynamic selector.
 */
export default function dynamicSelector<T extends (...args: any[]) => any>(
  selector: T
): SelectorWithDynamicFlag<T> {
  if (typeof selector !== 'function') {
    throw new TypeError('dynamicSelector expects a function');
  }

  (selector as SelectorWithDynamicFlag<T>)[DYNAMIC_SELECTOR] = true;
  return selector as SelectorWithDynamicFlag<T>;
}
