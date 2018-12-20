"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
    utility to reset the state of any module
    (to it's default  state)
 */
exports.resetModules = function (dispatch) { return function (modules) {
    if (modules === void 0) { modules = []; }
    for (var i = 0; i < modules.length; i++) {
        var module = modules[i];
        dispatch({
            type: module.name + "__RESET__"
        });
    }
}; };
//# sourceMappingURL=resetModules.js.map