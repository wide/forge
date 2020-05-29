import { loadRC, resolveOutput, postProcess, read, write } from '../workspace'
import postprocess from './twig/postprocess'
import Twig from './twig/instance'


/**
 * Compile many TWIG files
 * @param {Object} ctx
 * @param {Array<String>} ctx.files
 * @param {String} ctx.base subfolder
 * @param {String} ctx.dest folder
 * @param {Object} config
 */
export default async function({ files, base, dest }, config) {

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
  for(let file of files) {
    const stats = await compile(file, base, dest, rc)
    compiled.push(...stats)
  }

  return compiled
}


/**
 * Compile one TWIG file
 * @param {String} file path
 * @param {String} base subfolder
 * @param {String} dest folder
 * @param {Object} rc config
 */
async function compile(file, base, dest, rc) {

  // resolve output filename
  const { outfile } = resolveOutput(file, base, dest, '.html')

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
