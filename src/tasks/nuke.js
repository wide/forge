import { config } from '../workspace'
import { rimrafSync } from 'rimraf'
import chalk from 'chalk'


/**
 * Nuke dist folder
 */
export default async function() {
  console.log(`${chalk.blue('#')} nuke ${chalk.cyan(config.output)}`)
  rimrafSync(config.output)
  console.log(`${chalk.green('✓')} done`)
}