import { connect } from 'react-redux';
import { DYNAMIC_SELECTOR } from './dynamicSelector';
import type { ConnectParams, SelectorFn } from './types';

/**
 * Connects the state, selectors and dispatchers to components.
 * @example
 * import { connectStore } from "redux-box";
 * import { selectors, dispatchers } from "./store/userModule";
 *
 * connectStore({
 *  mapState: state => ({ name: state.user.name }),
 *  mapSelectors: { userProfile : getProfile },
 *  mapDispatchers: { getProfile: fetchProfile }
 * })
 *
 * @param {Object} connectParams - context object for connecting store to component
 * @param {Function} connectParams.mapState - maps store-state to component-props
 * @param {Object | Function} connectParams.mapDispatchers - maps module-dispatchers to component-props
 * @param {Object} connectParams.mapSelectors - maps module-selectors to component-props. Selectors marked with dynamicSelector are mapped as functions and evaluated on demand.
 * @param {Function} connectParams.mergeProps - merges returned values from mapState, mapSelectors and mapDispatchers to return final component-props
 * @param {Object} connectParams.options - optional object passed to react-redux's connect function as fourth argument
 * @returns {Function} - return the output of connect() from react-redux
 */

function connectStore(connectParams: ConnectParams = {}) {
  const {
    mapState = undefined,
    mapDispatchers = {},
    mapSelectors = {},
    mergeProps = undefined,
    options = undefined,
  } = connectParams;

  /* Map state and selectors to component-props */
  function mapStateToProps(state: any, props: any) {
    let finalProps: Record<string, any> = {};

    if (mapState && typeof mapState === 'function') {
      finalProps = { ...mapState(state, props) };
    }

    /* Call all selectors with state and own props. */
    Object.entries(mapSelectors).forEach(([propName, selector]) => {
      if (
        (selector as SelectorFn & { [DYNAMIC_SELECTOR]?: true })[
          DYNAMIC_SELECTOR
        ]
      ) {
        finalProps[propName] = (...args: any[]) =>
          (selector as SelectorFn).call(undefined, state, props, ...args);
      } else {
        finalProps[propName] = (selector as SelectorFn).call(
          undefined,
          state,
          props
        );
      }
    });

    return finalProps;
  }

  // connect
  return connect(
    mapStateToProps,
    mapDispatchers,
    mergeProps,
    options
  );
}

export default connectStore;
