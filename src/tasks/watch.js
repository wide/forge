import { cwd, config } from '../workspace'
import compile         from './compile'
import chokidar        from 'chokidar'
import chalk           from 'chalk'
import path            from 'path'


/**
 * Base options for chokidar
 * @type {Object}
 */
const options = {
  persistant: true,
  usePolling: true,
  cwd: path.resolve(cwd, config.input)
}


/**
 * Run function on file change
 * @param {String} globpath 
 * @param {Function} fn 
 */
export function watcher(globpath, fn) {
  let ready = false
  return chokidar.watch(globpath, options)
                 .on('all', f => ready && fn(f))
                 .on('ready', () => ready = true)
}


/**
 * Watch task
 * @param {Array<String>} targets
 */
export default async function(...targets) {
  const _targets = targets.length ? targets : config.targets // no targets = all targets
  if(_targets.length) {
    console.log(chalk`{blue #} watch {magenta ${_targets.join(', ')}}`)
    for(const target of _targets) {
      const _observe = Array.isArray(config[target].observe) ? config[target].observe : [config[target].observe]
      for(let file of _observe) {
        watcher(file, async () => await compile([target]))
      }
    }
  }
}