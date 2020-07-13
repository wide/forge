import { cwd, config } from './workspace'
import chokidar from 'chokidar'
import path from 'path'

const options = {
  persistant: true,
  usePolling: true,
  cwd: path.resolve(cwd, config.input)
}

export default function(globpath, fn) {
  let ready = false
  return chokidar.watch(globpath, options)
                 .on('all', f => ready && fn(f))
                 .on('ready', () => ready = true)
}