
/**
 * Add globals data support with addGlobal() method
 * !! Override built-in render() method !!
 */
export default (core) => {
  if(!core.exports.addGlobal) {
    core.exports.globals = {}
    core.exports.addGlobal = (key, value) => core.exports.globals[key] = value
    core.Template.prototype._render = core.Template.prototype.render
    core.Template.prototype.render = function(context, params) {
      const data = Object.assign({}, core.exports.globals, context)
      return this._render(data, params)
    }
  }
}