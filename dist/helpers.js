'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.moduleToReducer = exports.latest = exports.every = undefined;

var _reducer = require('./reducer');

var _reducer2 = _interopRequireDefault(_reducer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var every = exports.every = function every(str) {
  return str + '.every';
};
var latest = exports.latest = function latest(str) {
  return str + '.latest';
};
var moduleToReducer = exports.moduleToReducer = function moduleToReducer(module) {
  return (0, _reducer2.default)(module.mutations, module.state);
};