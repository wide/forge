#!/usr/bin/env node
import './cli/env'
import { nuke, copy, compile, build, watch, serve } from './tasks'
import { config } from './cli/workspace'
import pkg from '../package.json'
import yargs from 'yargs'
import chalk from 'chalk'


/**
 * Run CLI command
 */
try {

  // hello world
  console.log(chalk`{blue.bold ${pkg.name}} v${pkg.version} {blueBright.bold (${process.env.NODE_ENV})}`)
  const argv = yargs.argv

  // command list
  const commands = {
    nuke,
    copy,
    watch: () => watch(...argv._),
    compile: () => compile(...argv._),
    build,
    serve,
    ...config.commands
  }

  // resolve command name
  const command = argv._.shift()
  if(command && !commands[command]) {
    throw `unknown command '${command}'`
  }

  // execute command
  commands[command](argv)
}
catch(err) {
  console.error(err)
}