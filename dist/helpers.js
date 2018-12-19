"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.using = function (str) {
    if (str === void 0) { str = ""; }
    if (str.length > 0)
        return str.split(",").map(function (item) { return item.trim(); });
    else
        return [];
};
var RX_CAPS = /(?!^)([A-Z])/g;
var toSnakeCase = function (s) {
    return s
        .replace(/\.?([A-Z])/g, function (x, y) {
        return "_" + y.toLowerCase();
    })
        .replace(/^_/, "")
        .toUpperCase();
};
exports.createActions = function (list) {
    var finalObj = list;
    Object.keys(list).forEach(function (key) {
        var value = list[key];
        if (Array.isArray(value)) {
            finalObj[key] = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var action = { type: toSnakeCase(key) };
                if (args.length > 0) {
                    args.forEach(function (arg, i) { return (action[value[i]] = arg); });
                }
                return action;
            };
        }
    });
    return finalObj;
};
exports.pluck = function (obj, keys) {
    var finalObj = {};
    keys = keys.map(function (key) { return key.trim(); });
    Object.keys(obj).forEach(function (key) {
        key = key.trim();
        if (keys.includes(key))
            finalObj[key] = obj[key];
    });
    return finalObj;
};
var Shallowdiffers = function (a, b) {
    for (var i in a)
        if (!(i in b))
            return true;
    for (var i in b)
        if (a[i] !== b[i])
            return true;
    return false;
};
var doubleDiffers = function (a, b) {
    for (var i in a)
        if (!(i in b)) {
            return true;
        }
    for (var i in b) {
        if (typeof a[i] == "object" && typeof b[i] == "object") {
            if (Shallowdiffers(a[i], b[i])) {
                return true;
            }
        }
        else if (a[i] !== b[i]) {
            return true;
        }
    }
    return false;
};
exports.areSame = function (a, b) {
    var x = doubleDiffers(a, b);
    return !x;
};
//# sourceMappingURL=helpers.js.map