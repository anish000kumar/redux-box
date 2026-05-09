import type { Reducer, Action, Middleware } from 'redux';

/**
 * Augment the global Window type with the redux devtools compose hook so
 * `composeEnhancers` can reference it without `as any` casts.
 */
declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: (options?: any) => any;
  }
}

export type Mutations = Record<string, (state: any, action: any) => void>;

/**
 * A redux-box module. `id` is optional because it is added by `createModule`,
 * but `createStore` also accepts plain module objects passed directly.
 */
export interface Module {
  id?: string;
  name?: string;
  state?: any;
  mutations?: Mutations;
  sagas?: any[];
  selectors?: Record<string, (...args: any[]) => any>;
  dispatchers?: Record<string, (...args: any[]) => Action>;
  decorateReducer?: (reducer: Reducer) => Reducer;
  [key: string]: any;
}

/**
 * A module after it has been processed by `createModule` - same as `Module`
 * but with `id` guaranteed to be set.
 */
export type RegisteredModule = Module & { id: string };

export interface StoreConfig {
  middlewares?: Middleware[];
  reducers?: Record<string, Reducer>;
  sagas?: any[];
  preloadedState?: any;
  devToolOptions?: any;
  enableDevTools?: () => boolean;
  composeRedux?: (compose: any) => any;
  decorateReducer?: (reducer: Reducer) => Reducer;
}

export type SelectorFn = (state: any, props?: any, ...args: any[]) => any;

export interface ConnectParams {
  mapState?: (state: any, props?: any) => Record<string, any>;
  mapDispatchers?: any;
  mapSelectors?: Record<string, SelectorFn>;
  mergeProps?: any;
  options?: any;
}
