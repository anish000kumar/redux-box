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
  const arr = [];
  const delimiter = '__@';
  const sagaKeys = Object.keys(sagasObject);
  sagaKeys.forEach(key => {
    const action = key.split(delimiter)[0];
    const workerSaga = sagasObject[key];
    const mode = key.split(delimiter)[1] || 'latest';

    let watcher = function*() {
      yield takeLatest(action, workerSaga);
    };

    if (mode === 'every') {
      watcher = function*() {
        yield takeEvery(action, workerSaga);
      };
    }

    arr.push(watcher());
  });
  return arr;
}

export default createSagas;
