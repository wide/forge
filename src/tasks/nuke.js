import { config } from '../workspace'
import rimraf     from 'rimraf'
import chalk      from 'chalk'


/**
 * Nuke dist folder
 */
export default async function() {
  console.log(chalk`{blue #} nuke {cyan ${config.output}}`)
  rimraf.sync(config.output)
  console.log(chalk`  {green ✓} done`)
}