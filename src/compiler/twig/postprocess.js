import beautify from 'js-beautify'
import _        from 'lodash'


/**
 * Expose postprocess functions
 * @type {Object<string, Function>}
 */
export default {

  /**
   * Beautify HTML code
   * @param {String} html 
   * @param {Object} opts 
   * @return {String}
   */
  beautify(html, opts) {
    const _opts = _.merge({
      indent_size: 2,
      indent_char: ' ',
      max_preserve_newlines: 1,
      preserve_newlines: true
    }, opts)
    return beautify.html(html, _opts)
  }

}