import type { Action } from 'redux';
type Mutations = Record<string, (state: any, action: any) => void>;
/**
 * Returns reducer for the module, given the module's mutations and initialState
 *
 * @param {Object<String, Function>} mutations - Mutations object for the module
 * @param {Object} initialState - initialState for the module
 * @returns {Function} reducer
 */
declare function getReducer(mutations: Mutations, initialState: any): (state: any | undefined, action: Action) => any;
export default getReducer;
