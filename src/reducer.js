import produce from "immer";

const getReducer = (actionList, initialState, name) => {
	return  ( state = initialState, action) => {
		let method = actionList[action.type];
		if(action.type== name+'__RESET__'){
			return initialState
		}
		else if(method){
			const nextState = produce(state, draft_state => {
				method( draft_state , action);
			})
			return nextState;
		}
		else 
			return state
	}
};
export default getReducer;
