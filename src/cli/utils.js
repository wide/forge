import { keyBy } from "lodash";


/**
 * Wether item is an object struct
 * @param {*} item 
 * @return {Boolean}
 */
export function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item))
}


/**
 * Immutable deep merge
 * @param {Object} a 
 * @param {Object} b
 * @return {Object} 
 */
export function merge(a, b) {
  let merged = Object.assign({}, a)
  if(isObject(a) && isObject(b)) {
    for(let k in b) {
      Object.assign(merged, {
        [k]: isObject(b[k]) ? merge(merged[k], b[k]) : b[k]
      })
    }
  }
  return merged
}