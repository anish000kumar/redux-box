import { produce } from 'immer';
import type { Action } from 'redux';

type Mutations = Record<string, (state: any, action: any) => void>;

/**
 * Returns reducer for the module, given the module's mutations and initialState
 *
 * @param {Object<String, Function>} mutations - Mutations object for the module
 * @param {Object} initialState - initialState for the module
 * @returns {Function} reducer
 */
function getReducer(mutations: Mutations, initialState: any) {
  return function _reducer(state: any = initialState, action: Action) {
    const mutationMethod = mutations[action.type as string];

    if (mutationMethod) {
      const nextState = produce(state, (draftState: any) => {
        mutationMethod(draftState, action);
      });
      return nextState;
    }

    return state;
  };
}
export default getReducer;
