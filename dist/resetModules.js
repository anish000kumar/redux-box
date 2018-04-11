"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

/*
	utility to reset the state of any module 
	(to it's default  state)
 */
var resetModules = exports.resetModules = function resetModules(dispatch) {
  return function () {
    var modules = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    for (var i = 0; i < modules.length; i++) {
      var module = modules[i];
      dispatch({
        type: module.name + "__RESET__"
      });
    }
  };
};