"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports["default"] = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _effects = require("redux-saga/effects");
/**
 * @typedef {Object} SagaObject - Object containing watcher and worker sagas
 * @property {Generator=} watcher - watcher saga
 * @property {Generator=} worker - worker saga
 * @property {('every'| 'latest')=} watchFor - Accepts
 */

/**
 * Function to create watcher and worker sagas for redux store
 * @example
 * createSagas({
 *  FETCH_USERS: function* fetchUser(){
 *    const users = yield call(api.fetchUsers);
 *   }
 * })
 * @param {Object<ActionName, Generator|SagaObject>} sagasObject
 * Object containing module's sagas.
 * The key is name of  the action that triggers the saga and value is generator or SagaObject
 * @returns {Generator[]}  array of watcher sagas
 *
 */
function createSagas(sagasObject) {
  var arr = [];
  var delimiter = '__@';
  var sagaKeys = Object.keys(sagasObject);
  sagaKeys.forEach(function (key) {
    var action = key.split(delimiter)[0];
    var workerSaga = sagasObject[key];
    var mode = key.split(delimiter)[1] || 'latest';
    var watcher = /*#__PURE__*/_regenerator["default"].mark(function watcher() {
      return _regenerator["default"].wrap(function (_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            _context.next = 1;
            return (0, _effects.takeLatest)(action, workerSaga);
          case 1:
          case "end":
            return _context.stop();
        }
      }, watcher);
    });
    if (mode === 'every') {
      watcher = /*#__PURE__*/_regenerator["default"].mark(function watcher() {
        return _regenerator["default"].wrap(function (_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 1;
              return (0, _effects.takeEvery)(action, workerSaga);
            case 1:
            case "end":
              return _context2.stop();
          }
        }, watcher);
      });
    }
    arr.push(watcher());
  });
  return arr;
}
var _default = exports["default"] = createSagas;