
export const using = (str) => str.split(',').map(item => item.trim())
const RX_CAPS = /(?!^)([A-Z])/g
const isArr = (data) => Object.prototype.toString.call(data) == '[object Array]';

const toSnakeCase = function (s){
    return s.replace(/\.?([A-Z])/g,  (x,y) =>{
      return "_" + y.toLowerCase()
    })
    .replace(/^_/, "").toUpperCase()
}
                         
export const createActions = function(list) {
  let finalObj = list
  Object.keys(list).forEach( key => {
    let value = list[key];
    if(isArr(value)){
        finalObj[key] = (...args) => {
        let action = { type: toSnakeCase(key) }
        args.forEach((arg, i) => action[value[i]] = arg)
        return action
      }
    }
  })
  
  return finalObj
}
