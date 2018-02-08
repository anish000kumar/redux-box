const state = {
  name  : 'John',
  email : 'john@doe.com'
}

const actions = {
  setName  : (name)  => ({ type : 'SET_NAME',  name  }),
  setEmail : (email) => ({ type : 'SET_EMAIL', email }),
}

const mutations = {
  SET_NAME  : (state, action) => state.name  = action.name,
  SET_EMAIL : (state, action) => state.email = action.email
}
const computed = ({state}) => ({
  name_test : state.name+"11"
})

const sagas = {}

export default {
  name : 'user',
  state, 
  actions, 
  mutations, 
  computed,
  sagas,
  decorateReducer : (reducer) => reducer
}