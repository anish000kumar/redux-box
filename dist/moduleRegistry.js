import _extends from "@babel/runtime/helpers/esm/extends";
function ModuleRegistry() {
  this.modules = {};
}
ModuleRegistry.prototype.register = function registerModule(name, module) {
  this.modules[module.id] = _extends({
    name: name
  }, module);
};
ModuleRegistry.prototype.getName = function getModuleName(id) {
  return this.modules[id] ? this.modules[id].name : null;
};
var registry = new ModuleRegistry();
export default registry;