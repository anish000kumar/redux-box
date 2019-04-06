"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _reactRedux = require("react-redux");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
function connectStore() {
  let connectContext = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  const _connectContext$mapSt = connectContext.mapState,
        mapState = _connectContext$mapSt === void 0 ? state => state : _connectContext$mapSt,
        _connectContext$mapDi = connectContext.mapDispatchers,
        mapDispatchers = _connectContext$mapDi === void 0 ? {} : _connectContext$mapDi,
        _connectContext$mapSe = connectContext.mapSelectors,
        mapSelectors = _connectContext$mapSe === void 0 ? {} : _connectContext$mapSe,
        _connectContext$merge = connectContext.mergeProps,
        mergeProps = _connectContext$merge === void 0 ? () => {} : _connectContext$merge,
        _connectContext$optio = connectContext.options,
        options = _connectContext$optio === void 0 ? {} : _connectContext$optio;
  /* Map state and selectors to component-props */

  function mapStateToProps(state, props) {
    const finalProps = _objectSpread({}, mapState(state, props));
    /* Call all selectors with  */


    Object.entries(mapSelectors).forEach((_ref) => {
      let _ref2 = _slicedToArray(_ref, 2),
          propName = _ref2[0],
          selector = _ref2[1];

      finalProps[propName] = selector.call(undefined, state, props);
    });
    return finalProps;
  } //connect


  return (0, _reactRedux.connect)(mapStateToProps, mapDispatchers, mergeProps, options);
}

var _default = connectStore;
exports.default = _default;