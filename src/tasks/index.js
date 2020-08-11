import _compile from './compile'
import _watch   from './watch'
import _serve   from './serve'
import _nuke    from './nuke'
import _copy    from './copy'

export { default as compile } from './compile'
export { default as watch }   from './watch'
export { default as nuke }    from './nuke'
export { default as copy }    from './copy'


/**
 * Build (nuke, copy and compile)
 */
export async function build() {
  await _nuke()
  await _compile()
  await _copy()
}


/**
 * Server task (build, watch and start server)
 */
export async function serve(opts) {
  await build()
  await _watch()
  await _serve(opts)
}