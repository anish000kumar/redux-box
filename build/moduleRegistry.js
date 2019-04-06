"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function ModuleRegistry() {
  this.modules = {};
}

ModuleRegistry.prototype.register = function registerModule(name, module) {
  this.modules[module.id] = _objectSpread({
    name
  }, module);
};

ModuleRegistry.prototype.getName = function getModuleName(id) {
  this.modules[id].name;
};

const registry = new ModuleRegistry();
var _default = registry;
exports.default = _default;