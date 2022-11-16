import { config } from '../workspace'
import compiler   from '../compiler'


/**
 * Compile targets
 * @param {Array<String>} targets
 */
export default async function(...targets) {
  const _targets = targets.length ? targets : config.targets // no targets = all targets
  if(_targets.length) {
    await compiler(_targets)
  }
}