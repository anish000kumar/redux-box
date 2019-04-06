import { connect } from 'react-redux';
import mg from './storeManager';

/**
 * Connects the state, selectors and dispatchers to components.
 *
 * @param {Object} connectContext - context object for connecting store to component
 * @param {Function} connectContext.mapState - maps store-state to component-props
 * @param {Object | Function} connectContext.mapDispatchers - maps module-dispatchers to component-props
 * @param {Object} connectContext.mapSelectors - maps module-selectors to component-props
 * @param {Function} connectContext.mergeProps - merges returned values from mapState, mapSelectors and mapDispatchers to return final component-props
 * @param {Object} options - optional object passed to react-redux's connect function as fourth argument
 * @returns {Function} - return the output of connect() from react-redux
 */
export default function connectStore(connectContext = {}) {
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
      finalProps[propName] = selector.call(undefined, state);
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
