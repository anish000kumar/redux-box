"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports["default"] = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
/**
 * Internal singleton that keeps track of every module attached to the redux
 * store and the key it was mounted under. The registry is populated by
 * {@link createStore} when it iterates the `modules` map and is consumed by
 * {@link createModule} helpers (`getName`, `getSelector`, `select`) so that
 * modules don't have to hard-code their slice key.
 *
 * You generally don't need to touch the registry yourself - it is exported
 * mostly for advanced use cases (testing, hot module replacement, debugging).
 *
 * @example
 * import moduleRegistry from 'redux-box/dist/moduleRegistry';
 *
 * // After createStore() has run, look up the slice key for a module id:
 * const sliceKey = moduleRegistry.getName(userModule.id);
 *
 * @class ModuleRegistry
 */
var ModuleRegistry = /*#__PURE__*/function () {
  function ModuleRegistry() {
    this.modules = {};
  }
  var _proto = ModuleRegistry.prototype;
  /**
   * Registers a module under the key it is mounted with in the store.
   * Called automatically by {@link createStore} for every entry of the
   * `modules` argument.
   *
   * @param {String} name - The key the module is mounted under in the store.
   * @param {Object} module - The module object returned by {@link createModule}. Must have an `id`.
   * @returns {void}
   */
  _proto.register = function register(name, module) {
    this.modules[module.id] = (0, _extends2["default"])({
      name: name
    }, module);
  }

  /**
   * Returns the store key a module was mounted under, given its id.
   *
   * @param {String} id - The unique id assigned to the module by {@link createModule}.
   * @returns {String|null} The mounted slice key, or `null` if the module is not registered.
   */;
  _proto.getName = function getName(id) {
    return this.modules[id] ? this.modules[id].name : null;
  };
  return ModuleRegistry;
}();
var registry = new ModuleRegistry();
var _default = exports["default"] = registry;