"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createContainer;

var _reactRedux = require("react-redux");

/*
	utility to access the store using render function
*/
function createContainer(module) {
  var mapStateToProps = function mapStateToProps(state) {
    return state[module.name];
  };
  var mapDispatchToProps = function mapDispatchToProps(dispatch) {
    return Object.keys(module.actions).map(function (key) {
      var action = module.actions[key];
      return dispatch(action());
    });
  };

  var Container = function Container(props) {
    return props.children(props);
  };
  return (0, _reactRedux.connect)(mapStateToProps, module.actions || {})(Container);
};