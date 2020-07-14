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
 * @param {Object} config
 * @param {Object} targetConfig
 */
export default async function(ctx, config, targetConfig) {

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
  for(let file of ctx.files) {
    const stats = await compile(file, ctx, targetConfig, rc)
    compiled.push(...stats)
  }

  return compiled
}


/**
 * Compile one SCSS file
 * @param {String} file path
 * @param {Object} ctx
 * @param {Object} targetConfig
 * @param {Object} rc
 */
async function compile(file, ctx, targetConfig, rc) {

  // resolve output filename
  const { outfile, outmap } = resolveOutput(file, ctx, targetConfig)

  // compile sass
  let { css, map } = await render({
    file,
    outDir: ctx.dest,
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