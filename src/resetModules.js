
/*
	utility to reset the state of any module 
	(to it's default  state)
 */
export const resetModules = dispatch => (modules = []) => {
  for (let i = 0; i < modules.length; i++) {
    let module = modules[i];
    dispatch({
      type: module.name + "__RESET__"
    });
  }
};
