#!/usr/bin/env node
import { config, absOutput } from './cli/workspace'
import compiler   from './cli/compiler'
import watcher    from './cli/watcher'
import server     from './cli/server'
import rimraf     from 'rimraf'
import chalk      from 'chalk'
import cpy        from 'cpy'


/**
 * Nuke dist folder
 */
export async function nuke() {
  console.log(chalk`{blue.bold #} nuke {cyan.bold ${config.output}}`)
  rimraf.sync(config.output)
  console.log(chalk`  {green.bold ✓} done`)
}


/**
 * Copy assets
 */
export async function copy() {
  console.log(chalk`{blue.bold #} copy static assets`)
  const done = await cpy(config.copy.entries, absOutput, {
    cwd: config.input,
    overwrite: true,
    parents: true
  })
  console.log(chalk`  {green.bold ✓} ${done.length} assets copied`)
}


/**
 * Compile targets
 * @param {Array<String>} targets
 */
export async function compile(...targets) {
  const _targets = targets.length ? targets : config.targets // no targets = all targets
  console.log(chalk`{blue.bold #} compile {magenta.bold ${_targets.join(', ')}}`)
  await compiler(_targets)
}


/**
 * Watch task
 * @param {Array<String>} targets
 */
export async function watch(...targets) {
  const _targets = targets.length ? targets : config.targets // no targets = all targets
  console.log(chalk`{blue.bold #} watch {magenta.bold ${_targets.join(', ')}}`)
  for(const target of _targets) {
    watcher(config[target].observe, async () => await compiler([target]))
  }
}


/**
 * Build (nuke, copy and compile)
 */
export async function build() {
  await nuke()
  await compile()
  await copy()
}


/**
 * Server task (build, watch and start server)
 */
export async function serve(opts) {
  await build()
  await watch()
  await server(opts)
}