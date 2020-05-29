import { isProd, loadRC, resolveOutput, postProcess, write } from '../workspace'
import postprocess from './sass/postprocess'
import plugins from './sass/plugins'
import { promisify } from 'util'
import sass from 'sass'


/**
 * Enable await/async on render function
 */
const render = promisify(sass.render)


/**
 * Compile many SCSS files
 * @param {Object} ctx
 * @param {Array<String>} ctx.files
 * @param {String} ctx.base subfolder
 * @param {String} ctx.dest folder
 * @param {Object} config
 */
export default async function({ files, base, dest }, config) {

  // get .sassrc
  const rc = loadRC('sass', {
    includePaths: [
      './node_modules/'
    ],
    importer: [],
    outputStyle: isProd ? 'compressed' : 'expanded',
    postprocess: {
      autoprefixer: false
    },
    alias: {
      '@/': config.input
    }
  })

  // add built-in plugins
  for(let i = plugins.length; i--;) {
    rc.importer.push(plugins[i](rc))
  }

  // compile files
  const compiled = []
  for(let file of files) {
    const stats = await compile(file, base, dest, rc)
    compiled.push(...stats)
  }

  return compiled
}


/**
 * Compile one SCSS file
 * @param {String} file path
 * @param {String} dest folder
 * @param {Object} rc config 
 */
async function compile(file, base, dest, rc) {

  // resolve output filename
  const { outfile, outmap } = resolveOutput(file, base, dest, '.css')

  // compile sass
  let { css, map } = await render({
    file,
    outDir: dest,
    ...rc
  })

  // postprocess output
  css = await postProcess(css, rc, postprocess)

  // write files
  return [
    await write(outfile, css),
    await write(outmap, map)
  ]
}