"use strict";

exports.__esModule = true;
exports["default"] = void 0;
var _immer = require("immer");
/**
 * Returns reducer for the module, given the module's mutations and initialState
 *
 * @param {Object<String, Function>} mutations - Mutations object for the module
 * @param {Object} initialState - initialState for the module
 * @returns {Function} reducer
 */
function getReducer(mutations, initialState) {
  return function _reducer(state, action) {
    if (state === void 0) {
      state = initialState;
    }
    var mutationMethod = mutations[action.type];
    if (mutationMethod) {
      var nextState = (0, _immer.produce)(state, function (draftState) {
        mutationMethod(draftState, action);
      });
      return nextState;
    }
    return state;
  };
}
var _default = exports["default"] = getReducer;