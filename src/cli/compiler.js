import { cwd, config, resolveInput } from './workspace'
import columnify from 'columnify'
import compilers from './compilers'
import chalk from 'chalk'
import path from 'path'

const KO = 1024
const MO = KO*1024

const _compilers = { ...compilers, ...config.compilers }


/**
 * Compile targets
 * @param {Array} targets
 */
export default async function(targets = []) {

  // collect compiled files
  const compiled = []
  for(let target of targets) {

    // fetch target config
    const cfg = config[target]
    let done = 0

    // ignore target
    if(cfg === false) {
      console.log(chalk`  {yellow.bold ~ skip} {magenta.bold ${target}} {yellow.bold (falsy config)}`)
      continue;
    }

    // bad config
    if(!cfg || !cfg.entries) {
      console.log(chalk`  {red.bold ✕ skip} {magenta.bold ${target}} {red.bold (missing config)}`)
      continue;
    }

    // get target's compiler
    const compiler = _compilers[cfg.compiler || target]
    if(!compiler) {
      throw `missing compiler for [${target}]`
    }

    // compiler has specific entries
    for(let entry of cfg.entries) {

      // resolve input path
      const ctx = resolveInput(entry, config.input, config.output, cfg.output)

      // execute compiler
      try {
        const generated = await compiler(ctx, config)
        compiled.push(...generated)
        done += generated.length
      }
      catch(err) {
        console.error(chalk`{red.bold Error!}`, err)
      }
    }

    // warn if no file compiled
    if(!done) {
      console.log(chalk`  {yellow.bold ~ skip} {magenta.bold ${target}} {yellow.bold (no entries)}`)
      continue
    }
  }

  // show generated files and their size
  if(compiled.length) logResults(compiled)
}


/**
 * Log generated files in table
 * @param {Array} compiled 
 */
function logResults(compiled) {

  const results = compiled.map(o => {
    const dirname = path.dirname(path.relative(cwd, o.filename))
    const basename = path.basename(o.filename)
    return {
      status: chalk`{green.bold ✓}`,
      output: chalk`${dirname}${path.sep}{cyan.bold ${basename}}`,
      size: (o.size > MO)
        ? chalk`{blueBright.bold ${(o.size / MO).toFixed(2)} mo}`
        : chalk`{blueBright.bold ${(o.size / KO).toFixed(2)} ko}`
    }
  })

  console.log(columnify(results, {
    showHeaders: false,
    config: {
      status: { align: 'right', minWidth: 3 },
      size: { align: 'right', minWidth: 12 }
    }
  }))
}