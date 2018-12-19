import produce from "immer";
import { Action as IAction } from "redux";

const getReducer = (
  actionList: object,
  initialState: object,
  name?: string
) => {
  return (state = initialState, action: IAction) => {
    let method: Function = actionList[action.type];
    if (action.type == name + "__RESET__") {
      return initialState;
    } else if (method) {
      const nextState = produce(state, (draft_state: object) => {
        method(draft_state, action);
      });
      return nextState;
    } else return state;
  };
};
export default getReducer;
