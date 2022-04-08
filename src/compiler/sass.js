import * as sass from 'sass-embedded'
import { env, loadRC, resolveOutput, postProcess, write } from '../workspace'
import postprocess from './sass/postprocess'
import importers from './sass/importers'


/**
 * Compile many SCSS files
 * @param {Object} ctx
 * @param {Object} config
 * @param {Object} targetConfig
 */
export default async function(ctx, config, targetConfig) {

  // get .sassrc
  const rc = loadRC('sass', {
    loadPaths: [
      './',
      './node_modules/'
    ],
    importers: [],
    style: env.prod ? 'compressed' : 'expanded',
    sourceMap: true,
    postprocess: {
      autoprefixer: false
    },
    alias: {
      '@/': config.input
    }
  })

  // add built-in importers
  if (importers.length) {
    const methods = {}
    for(let i = importers.length; i--;) {
      methods[importers[i].name] = importers[i](rc)
    }
    rc.importers.push(methods)
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
  const { outfile, outmap } = resolveOutput(file, ctx, targetConfig, '.css')

  // compile sass
  let { css, sourceMap } = await sass.compileAsync(file, {
    ...rc
  })

  // postprocess output
  css = css.toString()
  css = await postProcess(file, css, rc, postprocess)

  // prepare write files
  const outWrite = [await write(outfile, css)]
  if(sourceMap) {
    outWrite.push(await write(outmap, JSON.stringify(sourceMap)))
  }

  // write files
  return outWrite
}