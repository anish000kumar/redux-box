"use strict";

exports.__esModule = true;
exports["default"] = void 0;
var _reduxSaga = _interopRequireDefault(require("redux-saga"));
var _effects = require("redux-saga/effects");
var _redux = require("redux");
var _get = _interopRequireDefault(require("./utils/get"));
var _composeEnhancers = _interopRequireDefault(require("./composeEnhancers"));
var _moduleRegistry = _interopRequireDefault(require("./moduleRegistry"));
var _getReducer = _interopRequireDefault(require("./getReducer"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
/**
 * @typedef {Object} Module - Object representing module
 * @property {Object=} state - Initial state for the module
 * @property {Object<String, Function>=} dispatchers - Action dispatchers for the module
 * @property {Object<String, Generator>=} sagas - Sagas for the module
 * @property {Object<String, Function>=} mutations - Mutations for the module
 * @property {Object<String, Function>=} selectors - Selector for the module
 */

/**
 * Creates redux store
 * @example
 * import { createStore } from "redux-box";
 * import userModule from "./modules/user";
 * import marketplaceModule from "./modules/marketplace";
 *
 * createStore({userModule, marketplaceModule},{
 *  enableDevTools: () => true,
 *  devToolOptions: {}
 * })
 *
 * @param {Object<String, Module>} modules - Object containing all modules to be attached to store
 * @param {Function=} config.enableDevTools - (Optional)enable devtool conditionally
 * @param {Object} config -  Contains configuration for store
 * @param {Function[]} config.middlewares - Array of middlewares to be used in store
 * @param {Object<String, Function>=} config.reducers - (Optional) Object containing reducers to be used in store
 * @param {Generator[]} config.sagas - Array of watcher sagas to be used in store
 * @param {Object=} config.preloadedState - (Optional) Preloaded state for store
 * @param {Object=} config.devToolOptions - (Optional) options for redux dev tool
 * @param {Function=} config.decorateReducer - (Optional) decorator function for reducer formed by redux-box, has formed reducer as first argument
 * @returns {Object} store
 */
function createStore(modules, config) {
  var _marked = /*#__PURE__*/_regenerator().m(rootSaga);
  if (config === void 0) {
    config = {};
  }
  //  Array containing names of all registered modules
  var moduleNames = Object.keys(modules);

  // Initialize the middleware array
  var sagaMiddleware = (0, _reduxSaga["default"])();
  var middlewares = [sagaMiddleware];

  // push the provided middlewares in config object, to the middleware array
  if ((0, _get["default"])(config, 'middlewares.length', 0) > 0) {
    middlewares = middlewares.concat(config.middlewares);
  }

  // an object containing reducers for all modules, to  be fed to combineReducer
  var reducerList = Object.assign({}, config.reducers);
  var sagas = [];

  // iterate through each module and push the sagas and reducers of each module in thier respective array
  moduleNames.forEach(function (moduleName) {
    var module = modules[moduleName];
    _moduleRegistry["default"].register(moduleName, module);
    sagas = sagas.concat(module.sagas || []);
    var moduleReducer = (0, _getReducer["default"])(module.mutations || {}, module.state);
    if (module.decorateReducer) moduleReducer = module.decorateReducer(moduleReducer);
    reducerList[moduleName] = moduleReducer;
  });
  sagas = config.sagas ? sagas.concat(config.sagas) : sagas;

  // Modules built with `createSagas` ship watcher *factories* (zero-arg
  // functions returning a fresh generator). Plain generator instances
  // are still accepted for backwards-compatibility and for callers that
  // build their own watchers. Calling the factories here means each
  // `createStore` invocation gets its own brand-new generators, which is
  // essential when the same module objects are reused across multiple
  // stores - e.g. in tests that spin a fresh store per case.
  sagas = sagas.map(function (s) {
    return typeof s === 'function' ? s() : s;
  });
  var combinedReducer = (0, _redux.combineReducers)(reducerList);
  if (config.decorateReducer) {
    combinedReducer = config.decorateReducer(combinedReducer);
  }
  var preloadedState = config.preloadedState || {};
  var composer = (0, _composeEnhancers["default"])(config);
  // initialize the store using preloaded state, reducers and middlewares
  var store = (0, _redux.createStore)(combinedReducer, preloadedState, composer(_redux.applyMiddleware.apply(void 0, middlewares)));

  // rootsaga
  function rootSaga() {
    var _t;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.p = _context.n) {
        case 0:
          _context.p = 0;
          _context.n = 1;
          return (0, _effects.all)(sagas);
        case 1:
          _context.n = 3;
          break;
        case 2:
          _context.p = 2;
          _t = _context.v;
          console.error('[ERROR] Something went wrong in rootSaga: ', _t);
        case 3:
          return _context.a(2);
      }
    }, _marked, null, [[0, 2]]);
  }
  sagaMiddleware.run(rootSaga);
  return store;
}
var _default = exports["default"] = createStore;