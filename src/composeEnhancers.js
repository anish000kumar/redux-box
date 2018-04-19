import { compose } from "redux";

export default function composeEnhancers(config) {
  /*
    detect the environment to decide whether or not to plug in dev tools. 
    In react process.env.NODE_ENV refelcts the environment
    while in react-native __DEV__ flag reflects the same
  */
  const devTools =
    typeof window === "object" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;

  let enableDevTools = () => {
    let devMode = false;
    //check if it's development mode in react-native
    if (typeof __DEV__ === "boolean" && __DEV__) {
      devMode = true;
    }
    //check if it's development mode in react
    else if (
      typeof process == "object" &&
      process.env &&
      process.env.NODE_ENV &&
      process.env.NODE_ENV === "development"
    ) {
      devMode = true;
    }

    if (config && config.enableDevtools) {
      return config.enableDevtools(devMode);
    }
    return devMode;
  };

  let composeEnhancers = enableDevTools() ? devTools || compose : compose;
  if (config && config.composeRedux) {
    return config.composeRedux(composeEnhancers);
  }
  return composeEnhancers;
}
