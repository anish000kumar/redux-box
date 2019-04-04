import { connect } from 'react-redux';

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
 * @param {Object} connectParams.mapSelectors - maps module-selectors to component-props
 * @param {Function} connectParams.mergeProps - merges returned values from mapState, mapSelectors and mapDispatchers to return final component-props
 * @param {Object} connectParams.options - optional object passed to react-redux's connect function as fourth argument
 * @returns {Function} - return the output of connect() from react-redux
 */

function connectStore(connectParams = {}) {
  const {
    mapState = undefined,
    mapDispatchers = {},
    mapSelectors = {},
    mergeProps = undefined,
    options = undefined,
  } = connectParams;

  /* Map state and selectors to component-props */
  function mapStateToProps(state, props) {
    let finalProps = {};

    if (mapState && typeof mapState === 'function') {
      finalProps = { ...mapState(state, props) };
    }

    /* Call all selectors with  */
    Object.entries(mapSelectors).forEach(([propName, selector]) => {
      finalProps[propName] = selector.call(undefined, state, props);
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
