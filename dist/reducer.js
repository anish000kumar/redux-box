"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var immer_1 = require("immer");
var getReducer = function (actionList, initialState, name) {
    return function (state, action) {
        if (state === void 0) { state = initialState; }
        var method = actionList[action.type];
        if (action.type == name + "__RESET__") {
            return initialState;
        }
        else if (method) {
            var nextState = immer_1.default(state, function (draft_state) {
                method(draft_state, action);
            });
            return nextState;
        }
        else
            return state;
    };
};
exports.default = getReducer;
//# sourceMappingURL=reducer.js.map