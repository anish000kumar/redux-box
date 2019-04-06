function ModuleRegistry() {
  this.modules = {};
}

ModuleRegistry.prototype.register = function registerModule(name, module) {
  this.modules[module.id] = {
    name,
    ...module,
  };
};

ModuleRegistry.prototype.getName = function getModuleName(id) {
  return this.modules[id] ? this.modules[id].name : null;
};

const registry = new ModuleRegistry();

export default registry;
