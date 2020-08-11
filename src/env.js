import yargs from 'yargs'
import dotenv from 'dotenv'

// possible envs
const ENVS = ['production', 'development']
const FALLBACK = 'development'

// resolve debug flag
process.env.NODE_DEBUG = !!yargs.argv.debug

// resolve current env
if(!process.env.NODE_ENV) {

  // lookup specified env (--production or --development)
  for(let ENV of ENVS) {
    if(yargs.argv[ENV]) {
      process.env.NODE_ENV = ENV
      process.env[`NODE_ENV_${ENV.toUpperCase()}`] = true
    }
  }

  // if not env specifiec, fallback to development
  if(!process.env.NODE_ENV) {
    process.env.NODE_ENV = FALLBACK
    process.env[`NODE_ENV_${FALLBACK.toUpperCase()}`] = true
  }
}

// load .env vars
const { parsed } = dotenv.config()
export const dot = parsed

// return cli args
export const argv = yargs.argv

// return current env
export default process.env.NODE_ENV