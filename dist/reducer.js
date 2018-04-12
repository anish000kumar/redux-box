"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _immer = require("immer");

var _immer2 = _interopRequireDefault(_immer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getReducer = function getReducer(actionList, initialState, name) {
	return function () {
		var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
		var action = arguments[1];

		var method = actionList[action.type];
		if (action.type == name + '__RESET__') {
			return initialState;
		} else if (method) {
			var nextState = (0, _immer2.default)(state, function (draft_state) {
				method(draft_state, action);
			});
			return nextState;
		} else return state;
	};
};
exports.default = getReducer;