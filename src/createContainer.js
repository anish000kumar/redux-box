import { connect } from "react-redux";

/*
	utility to access the store using render function
*/
export default  function createContainer(module) {
    const mapStateToProps = state => state[module.name];
    const mapDispatchToProps = dispatch => {
      return Object.keys(module.actions).map(key => {
        let action = module.actions[key];
        return dispatch(action());
      });
    };
  
    const Container = props => props.children(props);
    return connect(mapStateToProps, module.actions || {})(Container);
  };