"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_redux_1 = require("react-redux");
/*
    utility to access the store using render function
*/
function createContainer(module) {
    var mapStateToProps = function (state) { return state[module.name]; };
    var mapDispatchToProps = function (dispatch) {
        return Object.keys(module.actions).map(function (key) {
            var action = module.actions[key];
            return dispatch(action());
        });
    };
    var Container = function (props) { return props.children(props); };
    return react_redux_1.connect(mapStateToProps, module.actions || {})(Container);
}
exports.default = createContainer;
//# sourceMappingURL=createContainer.js.map