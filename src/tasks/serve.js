import { config, loadRC } from '../workspace'
import BrowserSync        from 'browser-sync'
import chalk              from 'chalk'


/**
 * Sync instance
 * @type {BrowserSync}
 */
export const browser =  BrowserSync.create()


/**
 * Start dev server
 */
export default function(opts = {}) {

  console.log(chalk`{blue.bold #} serve {cyan.bold ${config.output}}`)
  const rc = loadRC('bsync')

  return browser.init({
    watch: true,
    open: opts.open,
    ghostMode: false,
    files: `${config.output}/**/*`,
    server: {
      baseDir: config.output,
      directory: false
    },
    port: opts.port || 1234,
    https: opts.https,
    ...rc
  })
}