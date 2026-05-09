"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports["default"] = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _reactRedux = require("react-redux");
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
    _connectParams$mergeP = _connectParams.mergeProps,
    mergeProps = _connectParams$mergeP === void 0 ? undefined : _connectParams$mergeP,
    _connectParams$option = _connectParams.options,
    options = _connectParams$option === void 0 ? undefined : _connectParams$option;

  /* Map state and selectors to component-props */
  function mapStateToProps(state, props) {
    var finalProps = {};
    if (mapState && typeof mapState === 'function') {
      finalProps = (0, _extends2["default"])({}, mapState(state, props));
    }

    /* Call all selectors with  */
    Object.entries(mapSelectors).forEach(function (_ref) {
      var propName = _ref[0],
        selector = _ref[1];
      finalProps[propName] = selector.call(undefined, state, props);
    });
    return finalProps;
  }

  // connect
  return (0, _reactRedux.connect)(mapStateToProps, mapDispatchers, mergeProps, options);
}
var _default = exports["default"] = connectStore;