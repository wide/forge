import { loadRC, resolveOutput, postProcess, write } from '../workspace'
import postprocess from './twig/postprocess'
import Twig from './twig/instance'


/**
 * Compile many TWIG files
 * @param {Object} ctx
 * @param {Object} config
 * @param {Object} targetConfig
 */
export default async function(ctx, config, targetConfig) {

  // get .twigrc
  const { data, functions, filters, ...rc } = loadRC('twig', {
    data: {},
    functions: {},
    filters: {},
    namespaces: {
      '@': config.input
    },
    postprocess: {
      beautify: true
    }
  })

  // fetch data
  for(let key in data) {
    Twig.addGlobal(key, data[key])
  }

  // import functions
  for(let key in functions) {
    Twig.extendFunction(key, functions[key])
  }

  // import filters
  for(let key in filters) {
    Twig.extendFilter(key, filters[key])
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
 * Compile one TWIG file
 * @param {String} file path
 * @param {Object} ctx
 * @param {Object} targetConfig
 * @param {Object} rc
 */
async function compile(file, ctx, targetConfig, rc) {

  // resolve output filename
  const { outfile } = resolveOutput(file, ctx, targetConfig)

  // compile twig to html
  let html = Twig.twig({
    path: file,
    async: false,
    debug: false,
    trace: false,
    ...rc
  }).render()

  // postprocess output
  html = await postProcess(html, rc, postprocess)

  // write files
  return [
    await write(outfile, html)
  ]
}
