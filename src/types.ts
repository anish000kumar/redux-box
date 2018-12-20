import { Middleware, Reducer, StoreEnhancer } from "redux";

export declare namespace ReduxBox {
  type DecorateReducer = (reducer: Reducer<any>) => Reducer<any>;
  type EnableDevTools = (isDevelopmentMode: boolean) => boolean;

  interface IModule {
    name: string;
    state: object;
    mutations?: object;
    actions?: object;
    selectors?: any[];
    sagas?: object;
    decorateReducer?: DecorateReducer;
  }

  interface IStoreConfig {
    middlewares?: Middleware[];
    preloadedState?: object;
    sagas?: object[];
    reducers?: { [key: string]: Reducer<any> };
    decorateReducer?: DecorateReducer;
    composeRedux?: StoreEnhancer<any>;
    enableDevTools?: EnableDevTools;
    sagaConfig?: {
      onError?: Function;
      retryDelay?: number;
    };
  }

  interface IModuleWithKeys {
    module: IModule;
    get: string;
  }

  interface IModuleSelectKeys {
    [key: string]: IModuleWithKeys;
  }

  interface IModuleAllKeys {
    [key: string]: IModule;
  }
  type IModules = IModuleAllKeys | IModuleSelectKeys;
}
