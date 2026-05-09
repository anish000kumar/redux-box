/**
 * @typedef {Object} SagaObject - Object containing watcher and worker sagas
 * @property {Generator=} watcher - watcher saga
 * @property {Generator=} worker - worker saga
 * @property {('every'| 'latest')=} watchFor - Accepts
 */
/**
 * Function to create watcher and worker sagas for redux store. The
 * returned array contains **generator factories** (zero-arg functions
 * that return a fresh generator each call) rather than already-started
 * generator instances. {@link createStore} invokes each factory when it
 * runs the root saga, so calling `createStore` multiple times — for
 * instance across test cases that each spin up their own store — gives
 * every store its own brand-new watcher generators.
 *
 * @example
 * createSagas({
 *  FETCH_USERS: function* fetchUser(){
 *    const users = yield call(api.fetchUsers);
 *   }
 * })
 *
 * @param {Object<ActionName, Generator|SagaObject>} sagasObject
 *   Object containing module's sagas. The key is name of the action that
 *   triggers the saga and value is the worker generator function.
 * @returns {Array<() => Generator>} array of watcher generator factories
 */
declare function createSagas(sagasObject: Record<string, (...args: any[]) => any>): (() => Iterator<any>)[];
export default createSagas;
