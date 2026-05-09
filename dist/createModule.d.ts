import type { Module } from './types';
/**
 * Generates an RFC4122-style v4 UUID. Used internally by {@link createModule}
 * to give every module a stable, unique id so it can be looked up in the
 * module registry regardless of the key it was mounted under in the store.
 *
 * @returns {String} A new UUID, e.g. `"3b1f0c64-0b2e-4a3f-8e65-7b6a8b4d9f10"`.
 */
export declare function generateId(): string;
/**
 * Wraps a plain module definition (state, mutations, sagas, selectors,
 * dispatchers) into a redux-box module. The returned object has a unique
 * `id` and a few helpers (`getName`, `getSelector`, `select`) that let
 * selectors and components reference the module without hard-coding the
 * key it was mounted under in the store.
 *
 * @example
 * // modules/user/index.js
 * import { createModule } from 'redux-box';
 * import * as mutations from './mutations';
 * import * as sagas from './sagas';
 * import * as selectors from './selectors';
 * import * as dispatchers from './dispatchers';
 *
 * export default createModule({
 *   name: 'user',
 *   state: { id: null, name: '' },
 *   mutations,
 *   sagas,
 *   selectors,
 *   dispatchers,
 * });
 *
 * @example
 * // Using the `select` helper to build a memoized selector
 * // that is independent of the key the module was mounted under.
 * const getUserName = userModule.select(user => user.name);
 *
 * @example
 * // Using the `lazySelect` helper to build a parameterized selector
 * // that is intended for use with `connectStore`'s `mapLazySelectors`.
 * const getUserById = userModule.lazySelect(
 *   (userSlice, id) => userSlice.byId[id],
 * );
 *
 * @param {Module} moduleObj - Plain module definition (see {@link Module}).
 * @returns {Object} The decorated module. In addition to the original keys it exposes:
 *   - `id` {String} - unique id assigned to this module.
 *   - `getName()` {Function} - returns the key the module was registered under in the store.
 *   - `getSelector()` {Function} - returns a `(state) => moduleState` selector.
 *   - `select(fn)` {Function} - builds a memoized reselect selector over the module state.
 *   - `lazySelect(fn)` {Function} - builds a parameterized `(state, ...args) => result`
 *     selector over the module state, intended for `connectStore`'s `mapLazySelectors`.
 */
declare function createModule(moduleObj: Module): Module & {
    id: string;
} & {
    __name?: string | null;
    getName: () => string | null;
    getSelector: () => (state?: any) => any;
    /**
     * `select` is generic so the type of `cb`'s return propagates into
     * the call-site selector — `getError(state)` is `string | null`,
     * not `any`.
     */
    select: <R>(cb: (moduleState: any) => R) => (state: any) => R;
    /**
     * Same idea for `lazySelect`: the inner callback's signature drives
     * the call-site signature, so `getById(state, id)` is
     * `Post | undefined` rather than `any`.
     */
    lazySelect: <R, A extends any[]>(cb: (moduleState: any, ...args: A) => R, opts?: {
        memoize?: <F extends (...a: any[]) => any>(fn: F) => F;
    }) => (state: any, ...args: A) => R;
};
export default createModule;
