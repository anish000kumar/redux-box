'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = connectStore;

var _reactRedux = require('react-redux');

var _helpers = require('./helpers');

var attachModuleSelectors = function attachModuleSelectors(moduleInstance, stateObj, state, props) {
  var module = null;
  if (moduleInstance.module && moduleInstance.get) {
    module = moduleInstance.module;
  } else {
    module = moduleInstance;
  }

  if (_typeof(module.selectors) == 'object') {
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
  var mapStateToProps = function mapStateToProps(state, props) {
    var finalState = {};
    Object.keys(modules).forEach(function (key) {
      var moduleInstance = modules[key];
      var module_name = moduleInstance.module && moduleInstance.module.name || moduleInstance.name;
      var stateObj = state[module_name];
      if (moduleInstance.get) {
        var filter_array = moduleInstance.get.split(",");
        stateObj = (0, _helpers.pluck)(stateObj, filter_array);
      }
      stateObj = attachModuleSelectors(moduleInstance, stateObj, state, props);
      finalState[key] = stateObj;
    });
    return finalState;
  };

  var mapDispatchToProps = function mapDispatchToProps(dispatch) {
    var finalProps = {};
    Object.keys(modules).forEach(function (key) {
      var moduleInstance = modules[key];
      var actions_obj = {};
      var module_actions = moduleInstance.module && moduleInstance.module.actions || moduleInstance.actions;
      if (module_actions) {
        Object.keys(module_actions).forEach(function (action_key) {
          var action = module_actions[action_key];
          actions_obj[action_key] = function () {
            return dispatch(action.apply(undefined, arguments));
          };
        });
        finalProps[key] = actions_obj;
      }
    });
    return finalProps;
  };
  var mergeProps = function mergeProps(state, actions, ownProps) {
    var finalModule = {};
    Object.keys(state).forEach(function (key) {
      var module_state = state[key];
      var module_actions = actions[key];
      finalModule[key] = Object.assign({}, module_state, module_actions);
    });
    return Object.assign({}, finalModule, ownProps);
  };
  return (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps, mergeProps, {
    pure: true,
    areStatePropsEqual: function areStatePropsEqual(a, b) {
      return (0, _helpers.areSame)(a, b);
    }
  });
};