import { config } from '../workspace'
import compiler   from '../compiler'
import chalk      from 'chalk'

/**
 * Compile targets
 * @param {Array<String>} targets
 */
export default async function(...targets) {
  const _targets = targets.length ? targets : config.targets // no targets = all targets
  if(_targets.length) {
    console.log(`${chalk.blue('#')} compile ${chalk.magenta(_targets.join(', '))}`)
    await compiler(_targets)
  }
}