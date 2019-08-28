import produce from 'immer';

/**
 * Returns reducer for the module, given the module's mutations and initialState
 *
 * @param {Object<String, Function>} mutations - Mutations object for the module
 * @param {Object} initialState - initialState for the module
 * @returns {Function} reducer
 */
function getReducer(mutations, initialState) {
  return function _reducer(state = initialState, action) {
    const mutationMethod = mutations[action.type];

    if (mutationMethod) {
      const nextState = produce(state, draftState => {
        mutationMethod(draftState, action);
      });
      return nextState;
    }

    return state;
  };
}
export default getReducer;
