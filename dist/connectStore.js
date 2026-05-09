"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports["default"] = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _reactRedux = require("react-redux");
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

function connectStore(connectParams) {
  if (connectParams === void 0) {
    connectParams = {};
  }
  var _connectParams = connectParams,
    _connectParams$mapSta = _connectParams.mapState,
    mapState = _connectParams$mapSta === void 0 ? undefined : _connectParams$mapSta,
    _connectParams$mapDis = _connectParams.mapDispatchers,
    mapDispatchers = _connectParams$mapDis === void 0 ? {} : _connectParams$mapDis,
    _connectParams$mapSel = _connectParams.mapSelectors,
    mapSelectors = _connectParams$mapSel === void 0 ? {} : _connectParams$mapSel,
    _connectParams$mapLaz = _connectParams.mapLazySelectors,
    mapLazySelectors = _connectParams$mapLaz === void 0 ? {} : _connectParams$mapLaz,
    _connectParams$mergeP = _connectParams.mergeProps,
    mergeProps = _connectParams$mergeP === void 0 ? undefined : _connectParams$mergeP,
    _connectParams$option = _connectParams.options,
    options = _connectParams$option === void 0 ? undefined : _connectParams$option;
  var lazySelectorEntries = Object.entries(mapLazySelectors);

  /**
   * Use the factory form of `mapStateToProps` so each connected component
   * instance gets its own `stateRef` and its own set of stable lazy
   * wrappers. Without this, two instances of the same connected component
   * would share a `stateRef` (which is harmless because they share state
   * anyway) but more importantly, two `connectStore(...)` results that are
   * applied to the same component would not get separate closures.
   */
  function makeMapStateToProps() {
    var stateRef = {
      current: null
    };
    var lazyProps = {};
    lazySelectorEntries.forEach(function (_ref) {
      var propName = _ref[0],
        selector = _ref[1];
      lazyProps[propName] = function () {
        var _ref2;
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        return (_ref2 = selector).call.apply(_ref2, [undefined, stateRef.current].concat(args));
      };
    });
    return function mapStateToProps(state, ownProps) {
      stateRef.current = state;
      var finalProps = {};
      if (mapState && typeof mapState === 'function') {
        finalProps = (0, _extends2["default"])({}, mapState(state, ownProps));
      }
      Object.entries(mapSelectors).forEach(function (_ref3) {
        var propName = _ref3[0],
          selector = _ref3[1];
        finalProps[propName] = selector.call(undefined, state, ownProps);
      });

      // Lazy selectors share the same wrapper references on every render
      // so react-redux's shallow equality check sees them as unchanged.
      Object.assign(finalProps, lazyProps);
      return finalProps;
    };
  }
  return (0, _reactRedux.connect)(makeMapStateToProps, mapDispatchers, mergeProps, options);
}
var _default = exports["default"] = connectStore;