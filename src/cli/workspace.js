import fs from 'fs'
import path from 'path'
import glob from 'glob'
import fse from 'fs-extra'
import { promisify } from 'util'
import { merge } from './utils'
import BASE_CONFIG from './base-config'


/**
 * Enable await/async fron FS functions
 */
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)


/**
 * Is prod and/or debug mode
 * @type {Object}
 */
export const env = {
  prod: (process.env.NODE_ENV === 'production'),
  debug: (process.env.NODE_DEBUG === 'true')
}


/**
 * Resolve current working dir
 * @type {String}
 */
export const cwd = process.cwd()


/**
 * Load rc file by name : [name].config.js -> .[name]rc.js -> .[name]rc -> package.json:[name]
 * @param {String} name 
 * @param {Object} base 
 * @return {Object}
 */
export function loadRC(name, base = {}) {
  const rc = loadFile(`${name}.config.js`) || loadFile(`.${name}rc.js`) || loadFile(`.${name}rc`, true)
  const pkg = loadFile('package.json') || {}
  return merge(base, rc || pkg[name])
}


/**
 * Load file in current working dir
 * @param {String} name 
 * @param {String} implicitJson 
 * @return {Object}
 */
export function loadFile(name, implicitJson = false) {
  const filepath = path.resolve(cwd, name)
  if(fs.existsSync(filepath)) {
    delete require.cache[filepath] // bust cache
    return implicitJson
      ? JSON.parse(fs.readFileSync(filepath))
      : require(filepath)
  }
}


/**
 * Base configuration merged with user config
 * @type {Object}
 */
export const config = loadRC('forge', BASE_CONFIG)


/**
 * Resolve absolute input path
 * @type {String}
 */
export const absInput = path.resolve(config.input)


/**
 * Resolve absolute output path
 * @type {String}
 */
export const absOutput = path.resolve(config.output)


/**
 * Resolve input path and filenames into Context object
 * @param {String} entry 
 * @param {Object} config 
 * @param {Object} targetConfig 
 * @return {Object}
 */
export function resolveInput(entry, config, targetConfig) {
  const entrypath = path.join(config.input, entry)
  const exclude = (targetConfig.exclude || []).map(ex => path.join(config.input, ex))
  const files = glob.sync(entrypath, { ignore: exclude })
  const base = entry.includes('**') ? entry.split('**')[0] : ''
  const dest = path.resolve(config.output, targetConfig.output)
  return {
    files,      // [/src/assets/main.scss, /src/assets/foo.scss]
    base,       // /src/assets/
    dest        // /dist/assets/
  }
}


/**
 * Resolve output path and filename
 * @param {String} file 
 * @param {Object} ctx 
 * @param {Object} targetConfig 
 * @param {String} outputExt 
 * @return {Object}
 */
export function resolveOutput(file, ctx, targetConfig, outputExt) {
  const inputExt = path.extname(file)
  const outname = path.basename(file, inputExt) + (targetConfig.ext || outputExt || inputExt)
  const outbase = targetConfig.flatten ? '' : path.dirname(file.split(ctx.base)[1])
  const outdest = path.resolve(ctx.dest, outbase)
  const outfile = path.resolve(outdest, outname)
  const outmap = `${outfile}.map`
  return {
    outname, // file.css
    outbase, // foo (empty if flatten:true)
    outdest, // /project/dist/assets/foo
    outfile, // /project/dist/assets/foo/file.css
    outmap   // /project/dist/assets/foo/file.css.map
  }
}


/**
 * Apply postprocess to output from RC config
 * @param {String} input 
 * @param {Object} rc 
 * @param {Object} processes
 * @return {String} 
 */
export async function postProcess(output, rc, processes) {
  for(let key in rc.postprocess) {
    if(typeof rc.postprocess[key] === 'function') {
      output = await rc.postprocess[key](output, rc.postprocess[key])
    }
    else if(processes[key]) {
      output = await processes[key](output, rc.postprocess[key])
    }
  }
  return output
}


/**
 * Read file content
 * @param {String} filename 
 * @return {String}
 */
export async function read(filename) {
  return (await readFile(filename)).toString()
}


/**
 * Write file content
 * @param {String} filename 
 * @param {String} content 
 * @return {Number}
 */
export async function write(filename, content) {
  await fse.ensureFile(filename)
  await writeFile(filename, content)
  return {
    filename,
    size: fs.statSync(filename).size
  }
}