import path   from 'path'
import _glob  from 'glob'
import fs     from 'fs'


/**
 * Replace SCSS alias with real path
 * @param {Object} rc
 * @return {Function}
 */
function alias(rc) {
  return function(url) {
    for(let alias in rc.alias) {
      if(url.startsWith(alias)) {
        const urlWithoutAlias = url.substr(alias.length)
        const realFilename = path.join(rc.alias[alias], urlWithoutAlias)
        return { file: realFilename }
      }
    }
    return null
  }
}


/**
 * Add glob path resolver
 * @param {Object} rc
 * @return {Function}
 */
function glob(rc) {
  return function(url, prev) {
    let filepath = path.resolve(path.dirname(prev), url) + `.{scss,sass,css}`
    if(_glob.hasMagic(filepath, { nobrace: true })) {
      const files = _glob.sync(filepath, { nodir: true })
      let contents = ''
      for(let file of files) {
        contents += fs.readFileSync(file, 'utf8')
      }
      return { contents }
    }
    return null
  }
}


/**
 * Expose plugins
 */
export default [
  alias,
  glob
]