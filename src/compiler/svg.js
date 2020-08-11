import { env, loadRC, cwd, read, write } from '../workspace'
import Spriter  from 'svg-sprite'
import path     from 'path'


/**
 * Compile many SVG files
 * @param {Object} ctx
 * @param {Object} config
 * @param {Object} targetConfig
 */
export default async function(ctx, config, targetConfig) {

  // load .svgrc
  const rc = loadRC('svg', {
    dest: ctx.dest,
    mode: {
      exemple: !env.prod,
      inline: true,
      symbol: {
        dest: '.',
        sprite: 'sprite.svg'
      }
    }
  })

  // create spriter instance
  const spriter = new Spriter(rc)
  for(let file of ctx.files) {
    const filepath = path.resolve(cwd, file) // abs path to avoid empty id
    spriter.add(filepath, null, await read(file))
  }

  // compile sprite
  const { symbol } = await compile(spriter)

  // write sprite in dest
  const spritename = path.resolve(ctx.dest, symbol.sprite.path)
  return [
    await write(spritename, symbol.sprite.contents)
  ]
}


/**
 * Compile SVG sprite
 * @param {Function} spriter
 * @return {Promise}
 */
async function compile(spriter) {
  return new Promise((resolve, reject) => {
    spriter.compile((err, res) => err ? reject(err) : resolve(res))
  })
}
