import getReducer from './reducer'

export const every = (str) => str + '.every'
export const latest = (str) => str + '.latest'
export const moduleToReducer = (module) => getReducer( module.mutations, module.state ) 