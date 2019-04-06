import { connect } from 'react-redux';

/**
 * Connects the state, selectors and dispatchers to components.
 * @example
 * import { connectStore } from "redux-box";
 * import { selectors, dispatchers } from "./store/userModule";
 *
 * connectStore({
 *  mapState: state => ({ name: state.user.name }),
 *  mapSelectors: { userProfile : selectors.getProfile },
 *  mapDispatchers: { getProfile: dispatchers.fetchProfile }
 * })
 *
 * @param {Object} connectContext - context object for connecting store to component
 * @param {Function} connectContext.mapState - maps store-state to component-props
 * @param {Object | Function} connectContext.mapDispatchers - maps module-dispatchers to component-props
 * @param {Object} connectContext.mapSelectors - maps module-selectors to component-props
 * @param {Function} connectContext.mergeProps - merges returned values from mapState, mapSelectors and mapDispatchers to return final component-props
 * @param {Object} connectContext.options - optional object passed to react-redux's connect function as fourth argument
 * @returns {Function} - return the output of connect() from react-redux
 */

function connectStore(connectContext = {}) {
  const {
    mapState = state => state,
    mapDispatchers = {},
    mapSelectors = {},
    mergeProps = () => {},
    options = {},
  } = connectContext;

  /* Map state and selectors to component-props */
  function mapStateToProps(state, props) {
    const finalProps = {
      ...mapState(state, props),
    };

    /* Call all selectors with  */
    Object.entries(mapSelectors).forEach(([propName, selector]) => {
      finalProps[propName] = selector.call(undefined, state, props);
    });

    return finalProps;
  }

  //connect
  return connect(
    mapStateToProps,
    mapDispatchers,
    mergeProps,
    options
  );
}

export default connectStore;
