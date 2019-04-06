"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _effects = require("redux-saga/effects");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

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
  let watcherSagaArray = [];
  Object.entries(sagasObject).forEach((_ref) => {
    let _ref2 = _slicedToArray(_ref, 2),
        triggeringAction = _ref2[0],
        sagaValue = _ref2[1];

    const watcher = null;

    if (typeof sagaValue === 'object') {
      const watchFor = sagaValue.watchFor || 'latest'; // if watcher and worker sagas have been provided, push and return

      if (sagaValue.worker && sagaValue.watcher) {
        watcherSagaArray.push(sagaValue.watcher(sagaValue.worker));
        return;
      } // else use watchFor


      switch (watchFor) {
        case 'latest':
          {
            watcher = function* watcher() {
              yield (0, _effects.takeLatest)(triggeringAction, sagaValue.worker);
            };

            break;
          }

        case 'every':
          {
            watcher = function* watcher() {
              yield (0, _effects.takeEvery)(triggeringAction, sagaValue.worker);
            };

            break;
          }
      }
    } else {
      watcher = function* watcher() {
        yield (0, _effects.takeLatest)(triggeringAction, sagaValue);
      };
    }

    if (isGenerator(watcher)) {
      watcherSagaArray.push(watcher());
    } else {
      console.warn("The watcher provided for ".concat(triggeringAction, " is not valid:  ").concat(watcher));
    }
  });
  return watcherSagaArray;
}

function isGenerator(fn) {
  return typeof watcher === 'function' && watcher.constructor.name === 'GeneratorFunction';
}

var _default = createSagas;
exports.default = _default;