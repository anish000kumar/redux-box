"use strict";
import "regenerator-runtime/runtime";
import getReducer from "./reducer";
import { IModule } from "./types";
export { createActions, using } from "./helpers";
export { default as connectStore } from "./connectStore";
export { default as createContainer } from "./createContainer";
export { default as createSagas } from "./createSagas";
export { default as createStore } from "./createStore";
export { resetModules } from "./resetModules";

export const moduleToReducer = (module: IModule) =>
  getReducer(module.mutations, module.state);
