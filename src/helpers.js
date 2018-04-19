export const using = (str = "") => {
  if (str.length > 0) return str.split(",").map(item => item.trim());
  else return [];
};

const RX_CAPS = /(?!^)([A-Z])/g;
const isArr = data => Object.prototype.toString.call(data) == "[object Array]";
const toSnakeCase = function(s) {
  return s
    .replace(/\.?([A-Z])/g, (x, y) => {
      return "_" + y.toLowerCase();
    })
    .replace(/^_/, "")
    .toUpperCase();
};

export const createActions = function(list) {
  let finalObj = list;
  Object.keys(list).forEach(key => {
    let value = list[key];
    if (isArr(value)) {
      finalObj[key] = (...args) => {
        let action = { type: toSnakeCase(key) };
        if (args.length > 0) {
          args.forEach((arg, i) => (action[value[i]] = arg));
        }
        return action;
      };
    }
  });

  return finalObj;
};


export const pluck = (obj, keys) =>{
  let finalObj = {};
  keys = keys.map(key => key.trim())
  Object.keys(obj).forEach(key => {
    key = key.trim();
    if(keys.includes(key))
      finalObj[key] = obj[key]
  })
  return finalObj;
}

const Shallowdiffers = (a, b) => {
  for (let i in a) if (!(i in b)) return true
  for (let i in b) if (a[i] !== b[i]) return true
  return false
}

 const doubleDiffers  = (a, b) => {
  for (let i in a) if (!(i in b)){
    return true
  }
  for (let i in b) {
    if(typeof a[i]=='object' && typeof b[i]=='object'){
      if (Shallowdiffers(a[i], b[i])) {
        return true
      }
    }
    else if (a[i] !== b[i]) {
      return true
    }
  }
  return false
}

export const areSame = (a, b) => {
  let x = doubleDiffers(a, b)
  return !x;
}

