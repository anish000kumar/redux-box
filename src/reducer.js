import produce from 'immer';
 
// const assign = (obj, prop, value) => {
//     if (typeof prop === "string")
// 		prop = prop.split(".");

//     if (prop.length > 1) {
//         var e = prop.shift();
//         assign(obj[e] , prop, value);
//     } else
//         obj[prop[0]] = value;
//   return obj
// }

 const getReducer = (actionList, initialState, name) => {
	// actionList['__SET__'+name] = function(state, {data}){
	// 	try{
	// 		 assign(state, data.target, data.value )
	// 	}
	// 	catch(err){
	// 		console.log('WARNING: the key specified for the setter wasn\'t valid', err)
	// 	}
	// }
	actionList[name+'__RESET__'] = function(state, action){
		try{
			state = initialState;
		}
		catch(err){
			console.log(`WARNING: __RESET__ action failed for module ${name}`,err)
		}
	}
	
	return  ( state = initialState, action) => {
		let method = actionList[action.type];
		if(method){
			const nextState = produce(state, draft_state => {
				method( draft_state , action);
			})
			return nextState;
		}
		else return state
	}
}
export default getReducer