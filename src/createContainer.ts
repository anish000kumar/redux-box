import { connect } from "react-redux";
import { IModule } from "./index";
import { Dispatch } from "redux";
/*
	utility to access the store using render function
*/
export default function createContainer(module: IModule) {
  const mapStateToProps = (state: object) => state[module.name];
  // const mapDispatchToProps = (dispatch: Dispatch) => {
  //   return Object.keys(module.actions).map(key => {
  //     let action: any = module.actions[key];
  //     return dispatch(action());
  //   });
  // };

  const Container = (props: any) => props.children(props);
  return connect(
    mapStateToProps,
    module.actions || {}
  )(Container);
}
