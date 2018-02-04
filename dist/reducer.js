"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _immer = require("immer");

var _immer2 = _interopRequireDefault(_immer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var assign = function assign(obj, prop, value) {
	if (typeof prop === "string") prop = prop.split(".");

	if (prop.length > 1) {
		var e = prop.shift();
		assign(obj[e], prop, value);
	} else obj[prop[0]] = value;
	return obj;
};

var getReducer = function getReducer(name, actionList, initialState) {
	actionList['__SET__' + name] = function (state, _ref) {
		var data = _ref.data;

		try {
			assign(state, data.target, data.value);
		} catch (err) {
			console.log('WARNING: the key specified for the setter wasn\'t valid', err);
		}
	};

	return function () {
		var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
		var action = arguments[1];

		var method = actionList[action.type];
		if (method) {
			var nextState = (0, _immer2.default)(state, function (draft_state) {
				method(draft_state, action);
			});
			return nextState;
		} else return state;
	};
};
exports.default = getReducer;