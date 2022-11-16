import { config, absOutput }  from '../workspace'
import chalk  from 'chalk'
import path   from 'path'
import cpy    from 'cpy'


/**
 * Copy assets
 */
export default async function() {
  console.log(chalk`\n{blue #} copy static assets`)
  const entries = [...config.copy.entries, ...config.copy.exclude.map(ex => `!${ex}`)]
  const output = path.resolve(absOutput, config.copy.output)
  const done = await cpy(entries, output, {
    cwd: config.input,
    overwrite: true,
    parents: true
  })
  console.log(chalk`  {green ✓} ${done.length} assets copied`)
}