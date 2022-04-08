import path from 'path'
import { pathToFileURL } from 'url'


/**
 * Replace SCSS alias with real path
 * @param {Object} rc
 * @return {Function}
 */
 function findFileUrl(rc) {
  return function findFileUrl(url) {
    for(let alias in rc.alias) {
      if(url.startsWith(alias)) {
        const urlWithoutAlias = url.substr(alias.length)
        const realFilename = path.join(rc.alias[alias], urlWithoutAlias)

        return new URL(pathToFileURL(realFilename))
      }
    }

    return null
  }
}


/**
 * Expose importers
 */
export default [
  findFileUrl
]