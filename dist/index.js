"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("regenerator-runtime/runtime");
var reducer_1 = require("./reducer");
var helpers_1 = require("./helpers");
exports.createActions = helpers_1.createActions;
exports.using = helpers_1.using;
var connectStore_1 = require("./connectStore");
exports.connectStore = connectStore_1.default;
var createContainer_1 = require("./createContainer");
exports.createContainer = createContainer_1.default;
var createSagas_1 = require("./createSagas");
exports.createSagas = createSagas_1.default;
var createStore_1 = require("./createStore");
exports.createStore = createStore_1.default;
var resetModules_1 = require("./resetModules");
exports.resetModules = resetModules_1.resetModules;
exports.moduleToReducer = function (module) {
    return reducer_1.default(module.mutations, module.state);
};
//# sourceMappingURL=index.js.map