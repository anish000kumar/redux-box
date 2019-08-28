"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

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
    var watcher =
    /*#__PURE__*/
    regeneratorRuntime.mark(function watcher() {
      return regeneratorRuntime.wrap(function watcher$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return (0, _effects.takeLatest)(action, workerSaga);

            case 2:
            case "end":
              return _context.stop();
          }
        }
      }, watcher);
    });

    if (mode === 'every') {
      watcher =
      /*#__PURE__*/
      regeneratorRuntime.mark(function watcher() {
        return regeneratorRuntime.wrap(function watcher$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return (0, _effects.takeEvery)(action, workerSaga);

              case 2:
              case "end":
                return _context2.stop();
            }
          }
        }, watcher);
      });
    }

    arr.push(watcher());
  });
  return arr;
}

var _default = createSagas;
exports["default"] = _default;