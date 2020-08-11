import autoprefixer from 'autoprefixer'
import postcss      from 'postcss'


/**
 * Expose postprocess functions
 */
export default {


  /**
   * Autoprefix CSS props for older browsers
   * @param {String} css
   * @param {Object} opts
   * @return {Promise<String>} 
   */
  async autoprefixer(css, opts) {
    const res = await postcss([ autoprefixer(opts) ]).process(css, { from: undefined })
    const warnings = res.warnings()
    if(warnings.length) {
      console.error('ERROR: Autoprefixer', warnings)
    }
    return res.css
  }

} 