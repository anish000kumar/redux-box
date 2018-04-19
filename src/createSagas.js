import { takeLatest, takeEvery } from "redux-saga/effects";

/*
	Syntactic sugar for easily accessing sagas
*/
export default function createSagas(saga_list){
    let arr = [];
    var GeneratorFunction = Object.getPrototypeOf(function*() {}).constructor;
    let saga_keys = Object.keys(saga_list);
    saga_keys.forEach(key => {
      let action = key.split(".")[0];
      let worker_saga = saga_list[key];
      let mode = key.split(".")[1] || "latest";
      let watcher = null;
      if (mode == "latest") {
        watcher = function*() {
          yield takeLatest(action, worker_saga);
        };
      } else if (mode == "every") {
        watcher = function*() {
          yield takeEvery(action, worker_saga);
        };
      }
      arr.push(watcher());
    });
    return arr;
  };
  