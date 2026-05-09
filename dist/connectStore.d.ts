import type { ConnectParams } from './types';
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
declare function connectStore(connectParams?: ConnectParams): import("react-redux").InferableComponentEnhancerWithProps<import("react-redux").DispatchProp<import("redux").UnknownAction> & Record<string, any>, any>;
export default connectStore;
