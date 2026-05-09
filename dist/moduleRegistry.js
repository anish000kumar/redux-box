"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports["default"] = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
function ModuleRegistry() {
  this.modules = {};
}
ModuleRegistry.prototype.register = function registerModule(name, module) {
  this.modules[module.id] = (0, _extends2["default"])({
    name: name
  }, module);
};
ModuleRegistry.prototype.getName = function getModuleName(id) {
  return this.modules[id] ? this.modules[id].name : null;
};
var registry = new ModuleRegistry();
var _default = exports["default"] = registry;