import { takeLatest, takeEvery } from 'redux-saga/effects';

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
  let arr = [];
  const delimiter = '__@';
  let saga_keys = Object.keys(sagasObject);
  saga_keys.forEach(key => {
    let action = key.split(delimiter)[0];
    let worker_saga = sagasObject[key];
    let mode = key.split(delimiter)[1] || 'latest';

    let watcher = function*() {
      yield takeLatest(action, worker_saga);
    };

    if (mode === 'every') {
      watcher = function*() {
        yield takeEvery(action, worker_saga);
      };
    }

    arr.push(watcher());
  });
  return arr;
}

export default createSagas;
