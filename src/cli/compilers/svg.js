import { isProd, loadRC, read, write } from '../workspace'
import Spriter from 'svg-sprite'
import path from 'path'


/**
 * Compile many SVG files
 * @param {Object} ctx
 * @param {Array<String>} ctx.files
 * @param {String} ctx.dest folder
 */
export default async function({ files, dest }) {

  // load .svgrc
  const rc = loadRC('svg', {
    dest,
    mode: {
      exemple: !isProd,
      symbol: {
        dest: '.',
        sprite: 'sprite.svg'
      }
    }
  })

  // create spriter instance
  const spriter = new Spriter(rc)
  for(let file of files) {
    spriter.add(file, null, await read(file))
  }

  // compile sprite
  const { symbol } = await compile(spriter)

  // write sprite in dest
  const spritename = path.resolve(dest, symbol.sprite.path)
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
