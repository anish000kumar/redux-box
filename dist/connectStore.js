"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _reactRedux = require("react-redux");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
function connectStore() {
  var connectParams = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var _connectParams$mapSta = connectParams.mapState,
      mapState = _connectParams$mapSta === void 0 ? undefined : _connectParams$mapSta,
      _connectParams$mapDis = connectParams.mapDispatchers,
      mapDispatchers = _connectParams$mapDis === void 0 ? {} : _connectParams$mapDis,
      _connectParams$mapSel = connectParams.mapSelectors,
      mapSelectors = _connectParams$mapSel === void 0 ? {} : _connectParams$mapSel,
      _connectParams$mergeP = connectParams.mergeProps,
      mergeProps = _connectParams$mergeP === void 0 ? undefined : _connectParams$mergeP,
      _connectParams$option = connectParams.options,
      options = _connectParams$option === void 0 ? undefined : _connectParams$option;
  /* Map state and selectors to component-props */

  function mapStateToProps(state, props) {
    var finalProps = {};

    if (mapState && typeof mapState === 'function') {
      finalProps = _objectSpread({}, mapState(state, props));
    }
    /* Call all selectors with  */


    Object.entries(mapSelectors).forEach(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          propName = _ref2[0],
          selector = _ref2[1];

      finalProps[propName] = selector.call(undefined, state, props);
    });
    return finalProps;
  } // connect


  return (0, _reactRedux.connect)(mapStateToProps, mapDispatchers, mergeProps, options);
}

var _default = connectStore;
exports["default"] = _default;