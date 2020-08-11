import { env, cwd, config, resolveInput } from '../workspace'
import columnify  from 'columnify'
import chalk      from 'chalk'
import path       from 'path'
import twig       from './twig'
import sass       from './sass'
import svg        from './svg'
import js         from './js'


const KO = 1024
const MO = KO*1024
const compilers = { twig, sass, svg, js, ...config.compilers }


/**
 * Compile targets
 * @param {Array} targets
 */
export default async function(targets = []) {

  // collect compiled files
  const compiled = []
  for(let target of targets) {

    // fetch target config
    const targetConfig = config[target]
    let done = 0

    // ignore target
    if(targetConfig === false) {
      console.log(chalk`  {yellow.bold ~ skip} {magenta.bold ${target}} {yellow.bold (falsy config)}`)
      continue;
    }

    // bad config
    if(!targetConfig || !targetConfig.entries) {
      console.log(chalk`  {red.bold ✕ skip} {magenta.bold ${target}} {red.bold (missing config)}`)
      continue;
    }

    // get target's compiler
    const compiler = compilers[targetConfig.compiler || target]
    if(!compiler) {
      throw `missing compiler for [${target}]`
    }

    // ensure array of entries
    const entries = Array.isArray(targetConfig.entries) ? targetConfig.entries : [targetConfig.entries]

    // compiler has specific entries
    for(let entry of entries) {

      // resolve input path
      const ctx = resolveInput(entry, config, targetConfig)
      if(!ctx.files.length) {
        continue // skip if no files resolved from entries glob path
      }

      // debug context
      if(env.debug) {
        console.log(chalk`  {gray.bold [debug]} {magenta.bold ${target}} input context`)
        console.log(ctx)
      }

      // execute compiler
      try {
        const generated = await compiler(ctx, config, targetConfig)
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
  if(compiled.length) {
    logResults(compiled)
  }
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