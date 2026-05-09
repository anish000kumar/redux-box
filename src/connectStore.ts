import { connect } from 'react-redux';
import type { ConnectParams, LazySelectorFn, SelectorFn } from './types';

/**
 * Connects state, eager selectors, lazy (parameterized) selectors and
 * dispatchers to a component.
 *
 * Two flavours of selectors are supported:
 *
 * - `mapSelectors` - eager selectors of the form `(state, ownProps) => value`.
 *   They are evaluated on every store update and their result is passed to
 *   the component as a prop. Use these for values the component renders.
 *
 * - `mapLazySelectors` - parameterized selectors of the form
 *   `(state, ...args) => value`. `connectStore` wraps each one into a
 *   `(...args) => value` callable that always reads the latest state, and
 *   exposes that callable as a prop. The function reference is **stable**
 *   across renders, so adding a lazy selector does not cause the connected
 *   component to re-render on unrelated dispatches. If you need the
 *   component to re-render when the underlying data changes, expose a
 *   regular eager selector (or `mapState` slice) that subscribes to it.
 *
 * @example
 * import { connectStore } from "redux-box";
 * import { selectors, dispatchers } from "./store/userModule";
 *
 * connectStore({
 *   mapState: state => ({ name: state.user.name }),
 *   mapSelectors: { userProfile: getProfile },
 *   mapLazySelectors: { getUserById: selectUserById },
 *   mapDispatchers: { fetchProfile: dispatchers.fetchProfile },
 * })
 *
 * @param {Object} connectParams - context object for connecting store to component
 * @param {Function} connectParams.mapState - maps store-state to component-props
 * @param {Object | Function} connectParams.mapDispatchers - maps module-dispatchers to component-props
 * @param {Object} connectParams.mapSelectors - maps eager module-selectors to component-props
 * @param {Object} connectParams.mapLazySelectors - maps parameterized module-selectors to callable component-props with stable references
 * @param {Function} connectParams.mergeProps - merges returned values from mapState, mapSelectors, mapLazySelectors and mapDispatchers to return final component-props
 * @param {Object} connectParams.options - optional object passed to react-redux's connect function as fourth argument
 * @returns {Function} - return the output of connect() from react-redux
 */

function connectStore(connectParams: ConnectParams = {}) {
  const {
    mapState = undefined,
    mapDispatchers = {},
    mapSelectors = {},
    mapLazySelectors = {},
    mergeProps = undefined,
    options = undefined,
  } = connectParams;

  const lazySelectorEntries = Object.entries(mapLazySelectors);

  /**
   * Use the factory form of `mapStateToProps` so each connected component
   * instance gets its own `stateRef` and its own set of stable lazy
   * wrappers. Without this, two instances of the same connected component
   * would share a `stateRef` (which is harmless because they share state
   * anyway) but more importantly, two `connectStore(...)` results that are
   * applied to the same component would not get separate closures.
   */
  function makeMapStateToProps() {
    const stateRef: { current: any } = { current: null };

    const lazyProps: Record<string, (...args: any[]) => any> = {};
    lazySelectorEntries.forEach(([propName, selector]) => {
      lazyProps[propName] = (...args: any[]) =>
        (selector as LazySelectorFn).call(undefined, stateRef.current, ...args);
    });

    return function mapStateToProps(state: any, ownProps: any) {
      stateRef.current = state;

      let finalProps: Record<string, any> = {};

      if (mapState && typeof mapState === 'function') {
        finalProps = { ...mapState(state, ownProps) };
      }

      Object.entries(mapSelectors).forEach(([propName, selector]) => {
        finalProps[propName] = (selector as SelectorFn).call(
          undefined,
          state,
          ownProps
        );
      });

      // Lazy selectors share the same wrapper references on every render
      // so react-redux's shallow equality check sees them as unchanged.
      Object.assign(finalProps, lazyProps);

      return finalProps;
    };
  }

  return connect(
    makeMapStateToProps,
    mapDispatchers,
    mergeProps,
    options
  );
}

export default connectStore;
