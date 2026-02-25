#!/usr/bin/env node
import './env'
import { nuke, copy, compile, build, watch, serve } from './tasks'
import { env, cwd, config } from './workspace'
import pkg from '../package.json'
import chalk from 'chalk'
import yargs from 'yargs'

/**
 * Run CLI command
 */
try {

  // builtin commands
  const nativeCommands = {
    nuke,
    copy,
    watch: () => watch(...argv._),
    compile: () => compile(...argv._),
    build,
    serve
  }

  // command list
  const commands = {
    ...nativeCommands,
    ...config.commands
  }

  // resolve command name
  const argv = yargs.argv
  const command = argv._.shift()
  if(command && !commands[command]) {
    throw `unknown command '${command}'`
  }

  // hello world - only for builtin commands
  if(command in nativeCommands) {
    console.log(`${chalk.blue(pkg.name)} v${pkg.version} ${chalk.yellow(process.env.NODE_ENV)}`)
  }

  // debug mode
  if(env.debug) {
    console.log(`${chalk.gray('[debug]')} config ${chalk.cyan(cwd)}`)
    console.log(config)
  }

  // execute command
  commands[command](argv, config)
}
catch(err) {
  console.error(chalk.red(err))
  process.exit(1)
}