"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _immer = _interopRequireDefault(require("immer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * Returns reducer for the module, given the module's mutations and initialState
 *
 * @param {Object<String, Function>} mutations - Mutations object for the module
 * @param {Object} initialState - initialState for the module
 * @returns {Function} reducer
 */
function getReducer(mutations, initialState) {
  return function _reducer() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
    var action = arguments.length > 1 ? arguments[1] : undefined;
    var mutationMethod = mutations[action.type];

    if (mutationMethod) {
      var nextState = (0, _immer["default"])(state, function (draftState) {
        mutationMethod(draftState, action);
      });
      return nextState;
    }

    return state;
  };
}

var _default = getReducer;
exports["default"] = _default;