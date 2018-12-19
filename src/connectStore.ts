import { connect } from "react-redux";
import { areSame, pluck } from "./helpers";
import { IModules } from "./types";

const attachModuleSelectors = (moduleInstance, stateObj, state, props) => {
  let module: any = null;
  if (moduleInstance.module && moduleInstance.get) {
    module = moduleInstance.module;
  } else {
    module = moduleInstance;
  }

  if (typeof module.selectors == "object") {
    Object.keys(module.selectors).forEach(selector_name => {
      let selector = module.selectors[selector_name];
      stateObj[selector_name] = selector(state[module.name], state);
    });
  }

  return stateObj;
};

/*
	Connect a component to any module
	TODO: namespacing
*/

export default function connectStore(modules: IModules) {
  const mapStateToProps = (state, props) => {
    let finalState = {};
    Object.keys(modules).forEach(key => {
      const moduleInstance = modules[key];
      let module_name =
        (moduleInstance.module && moduleInstance.module.name) ||
        moduleInstance.name;
      let stateObj = state[module_name];
      if (moduleInstance.get) {
        let filter_array = moduleInstance.get.split(",");
        stateObj = pluck(stateObj, filter_array);
      }
      stateObj = attachModuleSelectors(moduleInstance, stateObj, state, props);
      finalState[key] = stateObj;
    });
    return finalState;
  };

  const mapDispatchToProps = dispatch => {
    let finalProps = {};
    Object.keys(modules).forEach(key => {
      const moduleInstance = modules[key];
      const actions_obj = {};
      let module_actions =
        (moduleInstance.module && moduleInstance.module.actions) ||
        moduleInstance.actions;
      if (module_actions) {
        Object.keys(module_actions).forEach(action_key => {
          const action = module_actions[action_key];
          actions_obj[action_key] = (...args) => {
            return dispatch(action(...args));
          };
        });
        finalProps[key] = actions_obj;
      }
    });
    return finalProps;
  };
  const mergeProps = (state, actions, ownProps) => {
    let finalModule = {};
    Object.keys(state).forEach(key => {
      let module_state = state[key];
      let module_actions = actions[key];
      finalModule[key] = Object.assign({}, module_state, module_actions);
    });
    return Object.assign({}, finalModule, ownProps);
  };
  return connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps,
    {
      pure: true,
      areStatePropsEqual: (a, b) => areSame(a, b)
    }
  );
}
