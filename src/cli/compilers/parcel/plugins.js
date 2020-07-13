import path from 'path'


/**
 * Replace JS alias with real path
 * @param {Object} rc
 * @return {Function}
 */
function alias(rc) {
  return function(bundler) {
    const _resolver = bundler.resolver
    const _resolveAliases = _resolver.resolveAliases
    _resolver.resolveAliases = (filename, pkg) => {
      for (let alias in rc.alias) {
        if (filename.startsWith(alias)) {
          const aliasPath = path.resolve(rc.alias[alias])
          const filePath = filename.substr(alias.length)
          return path.join(aliasPath, filePath)
        }
      }
      return _resolveAliases.call(_resolver, filename, pkg)
    }
  }
}


/**
 * Expose plugins
 */
export default [
  alias
]