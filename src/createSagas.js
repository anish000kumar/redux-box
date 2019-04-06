import { takeLatest, takeEvery } from 'redux-saga/effects';

/**
 * Function to create watcher and worker sagas for redux store
 *
 * @typedef {Generator} Saga - a javascript generator, representing worker saga
 * @typedef {Object} SagaObject - Object containing watcher and worker sagas
 * @typedef {Generator=} SagaObject.watcher - watcher saga
 * @typedef {Generator=} SagaObject.worker - worker saga
 * @typedef {('every'| 'latest')=} SagaObject.watchFor - Accepts
 * @param {Object<String, Saga|SagaObject>} saga_list - Object contains all the sagas
 * @returns {Saga[]} - array of watcher sagas
 */

export default function createSagas(saga_list) {
  let watcherSagaArray = [];

  Object.entries(saga_list).forEach(([triggeringAction, sagaValue]) => {
    const watcher = null;
    if (typeof sagaValue === 'object') {
      const watchFor = sagaValue.watchFor || 'latest';

      // if watcher and worker sagas have been provided, push and return
      if (sagaValue.worker && sagaValue.watcher) {
        watcherSagaArray.push(sagaValue.watcher(sagaValue.worker));
        return;
      }

      // else use watchFor
      switch (watchFor) {
        case 'latest': {
          watcher = function*() {
            yield takeLatest(triggeringAction, sagaValue.worker);
          };
          break;
        }
        case 'every': {
          watcher = function*() {
            yield takeEvery(triggeringAction, sagaValue.worker);
          };
          break;
        }
      }
    } else {
      watcher = function*() {
        yield takeLatest(triggeringAction, sagaValue);
      };
    }

    if (isGenerator(watcher)) {
      watcherSagaArray.push(watcher());
    } else {
      console.warn(
        `The watcher provided for ${triggeringAction} is not valid:  ${watcher}`
      );
    }
  });

  return watcherSagaArray;
}

function isGenerator(fn) {
  return (
    typeof watcher === 'function' &&
    watcher.constructor.name === 'GeneratorFunction'
  );
}
