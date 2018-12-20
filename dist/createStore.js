"use strict";
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var composeEnhancers_1 = require("./composeEnhancers");
var redux_saga_1 = require("redux-saga");
var effects_1 = require("redux-saga/effects");
var reducer_1 = require("./reducer");
var redux_1 = require("redux");
/*
Iterate through each module and keep stacking our reducers
and sagas in their respective arrays. Finally
we use these arrays to initialize the store using
'createStore' from redux.
*/
function createStore(modules, config) {
    //Initialize middleware array
    var sagaMiddleware = redux_saga_1.default();
    var middlewares = [sagaMiddleware];
    //push the provided middlewares in config object, to the middleware array
    if (config && config.middlewares && config.middlewares.length > 0) {
        middlewares = middlewares.concat(config.middlewares);
    }
    var reducerList = Object.assign({}, config && config.reducers);
    var sagas = [];
    //iterate through each module and push the sagas and reducers of each module in thier respective array
    modules.forEach(function (module) {
        sagas = sagas.concat(module.sagas);
        var moduleReducer = reducer_1.default(module.mutations, module.state, module.name);
        if (module.decorateReducer)
            moduleReducer = module.decorateReducer(moduleReducer);
        reducerList[module.name] = moduleReducer;
    });
    sagas = config && config.sagas ? sagas.concat(config.sagas) : sagas;
    var combinedReducer = redux_1.combineReducers(reducerList);
    if (config && config.decorateReducer) {
        combinedReducer = config.decorateReducer(combinedReducer);
    }
    var preloadedState = config && config.preloadedState ? config.preloadedState : {};
    var composeRedux = composeEnhancers_1.default(config);
    //initialize the store using preloaded state, reducers and middlewares
    var store = redux_1.createStore(combinedReducer, preloadedState, composeRedux(redux_1.applyMiddleware.apply(void 0, middlewares)));
    // Default configuration for sagas
    var sagaConfig = Object.assign({}, {
        retryDelay: 2000,
        onError: function (err) { }
    }, config && config.sagaConfig);
    function rootSaga() {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!true) return [3 /*break*/, 6];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 5]);
                    return [4 /*yield*/, effects_1.all(sagas)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    sagaConfig.onError(err_1);
                    return [4 /*yield*/, effects_1.call(redux_saga_1.delay, sagaConfig.retryDelay)];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 5: return [3 /*break*/, 0];
                case 6: return [2 /*return*/];
            }
        });
    }
    sagaMiddleware.run(rootSaga);
    return store;
}
exports.default = createStore;
//# sourceMappingURL=createStore.js.map