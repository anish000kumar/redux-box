"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_redux_1 = require("react-redux");
var helpers_1 = require("./helpers");
var attachModuleSelectors = function (moduleInstance, stateObj, state, props) {
    var module = null;
    if (moduleInstance.module && moduleInstance.get) {
        module = moduleInstance.module;
    }
    else {
        module = moduleInstance;
    }
    if (typeof module.selectors == "object") {
        Object.keys(module.selectors).forEach(function (selector_name) {
            var selector = module.selectors[selector_name];
            stateObj[selector_name] = selector(state[module.name], state);
        });
    }
    return stateObj;
};
/*
    Connect a component to any module
    TODO: namespacing
*/
function connectStore(modules) {
    var mapStateToProps = function (state, props) {
        var finalState = {};
        Object.keys(modules).forEach(function (key) {
            var moduleInstance = modules[key];
            var module_name = moduleInstance.module
                ? moduleInstance.module.name
                : moduleInstance.name;
            var stateObj = state[module_name];
            if (moduleInstance.get) {
                var filter_array = moduleInstance.get.split(",");
                stateObj = helpers_1.pluck(stateObj, filter_array);
            }
            stateObj = attachModuleSelectors(moduleInstance, stateObj, state, props);
            finalState[key] = stateObj;
        });
        return finalState;
    };
    var mapDispatchToProps = function (dispatch) {
        var finalProps = {};
        Object.keys(modules).forEach(function (key) {
            var moduleInstance = modules[key];
            var actions_obj = {};
            var module_actions = (moduleInstance.module &&
                moduleInstance.module.actions) ||
                moduleInstance.actions;
            if (module_actions) {
                Object.keys(module_actions).forEach(function (action_key) {
                    var action = module_actions[action_key];
                    actions_obj[action_key] = function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        return dispatch(action.apply(void 0, args));
                    };
                });
                finalProps[key] = actions_obj;
            }
        });
        return finalProps;
    };
    var mergeProps = function (state, actions, ownProps) {
        var finalModule = {};
        Object.keys(state).forEach(function (key) {
            var module_state = state[key];
            var module_actions = actions[key];
            finalModule[key] = Object.assign({}, module_state, module_actions);
        });
        return Object.assign({}, finalModule, ownProps);
    };
    return react_redux_1.connect(mapStateToProps, mapDispatchToProps, mergeProps, {
        pure: true,
        areStatePropsEqual: function (a, b) { return helpers_1.areSame(a, b); }
    });
}
exports.default = connectStore;
//# sourceMappingURL=connectStore.js.map