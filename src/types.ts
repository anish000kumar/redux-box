import { Middleware, Reducer, StoreEnhancer } from "redux";

export declare namespace ReduxBox {
  type DecorateReducer = (reducer: Reducer) => Reducer;
  type EnableDevTools = (isDevelopmentMode: boolean) => boolean;

  interface IModule {
    name: string;
    state: object;
    mutations?: object;
    actions?: object;
    selectors?: any[];
    sagas?: object;
    decorateReducer?: Function;
  }

  interface IStoreConfig {
    middlewares?: Middleware[];
    preloadedState?: object;
    sagas?: object[];
    reducers?: { [key: string]: Reducer };
    decorateReducer?: DecorateReducer;
    composeRedux?: StoreEnhancer;
    enableDevTools?: EnableDevTools;
  }

  interface IModules {
    [key: string]: IModule;
  }
}
