"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = composeEnhancers;

var _redux = require("redux");

function composeEnhancers(config) {
  /*
    detect the environment to decide whether or not to plug in dev tools. 
    In react process.env.NODE_ENV refelcts the environment
    while in react-native __DEV__ flag reflects the same
  */
  var devTools = (typeof window === "undefined" ? "undefined" : _typeof(window)) === "object" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;

  var enableDevTools = function enableDevTools() {
    var devMode = false;
    //check if it's development mode in react-native
    if (typeof __DEV__ === "boolean" && __DEV__) {
      devMode = true;
    }
    //check if it's development mode in react
    else if ((typeof process === "undefined" ? "undefined" : _typeof(process)) == "object" && process.env && process.env.NODE_ENV && process.env.NODE_ENV === "development") {
        devMode = true;
      }

    if (config && config.enableDevTools) {
      return config.enableDevTools(devMode);
    }
    return devMode;
  };

  var composeEnhancers = enableDevTools() ? devTools || _redux.compose : _redux.compose;
  if (config && config.composeRedux) {
    return config.composeRedux(composeEnhancers);
  }
  return composeEnhancers;
}