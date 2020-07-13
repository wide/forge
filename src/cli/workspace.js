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
 * Is production env
 * @type {Boolean}
 */
export const isProd = (process.env.NODE_ENV === 'production')


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
  if(name === 'forge') {
    console.log('FORGE RC', rc)
    console.log('FORGE RC MERGED', merge(base, rc || pkg[name]))
  }
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
//console.log(config)


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
 * Resolve input path and filenames
 * @param {String} entry 
 * @param {String} inputDir 
 * @param {Sring} outputDir 
 * @param {String} targetDir 
 * @return {Object}
 */
export function resolveInput(entry, inputDir, outputDir, targetDir) {
  const entrypath = path.resolve(inputDir, entry)
  const files = glob.sync(entrypath)
  const base = entry.includes('**') ? entry.split('**')[0] : ''
  const dest = path.resolve(outputDir, targetDir)
  return {
    files,      // [/src/assets/main.scss, /src/assets/foo.scss]
    base,       // /src/assets/
    dest        // /dist/assets/
  }
}


/**
 * Resolve output path and filename
 * @param {String} file 
 * @param {String} base 
 * @param {String} dest 
 * @param {String} outputExt 
 * @return {Object}
 */
export function resolveOutput(file, base, dest, outputExt) {
  const inputExt = path.extname(file)
  const outname = path.basename(file, inputExt) + (outputExt || inputExt)
  const outbase = path.dirname(file.split(base)[1])
  const outdest = path.resolve(dest, outbase)
  const outfile = path.resolve(outdest, outname)
  const outmap = `${outfile}.map`
  return {
    outname, // file.css
    outbase, // foo
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