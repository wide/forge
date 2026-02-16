import { loadRC, write } from '../workspace'
import path     from 'path'
import { favicons } from "favicons"


/**
 * Compile favicons files
 * @param {Object} ctx
 * @param {Array}  ctx.files favicons to compile
 * @param {String} ctx.dest folder to write favicons
 */
 export default async function(ctx) {

  // get .faviconsrc
  const rc = loadRC('favicons', {
    icons: {
      android: true,
      appleIcon: true,
      appleStartup: false,
      coast: false,
      favicons: true,
      firefox: false,
      opengraph: false,
      twitter: false,
      windows: true,
      yandex: false
    }
  })

  // compile and return files
  return compile(ctx.files, ctx.dest, rc)
}


/**
 * Compile one favicon file
 * @param {String|Array<String>} files Files to compile
 * @param {String} dest Destination to write files
 * @param {Object} rc Favicon moodule configuration
 */
async function compile(files, dest, rc) {
  // create the favicons
  const stats = await favicons(files, rc)

  // store written images
  const compiled = []

  // loop over all images and write them
  for (const favicon of stats.images) {
    // create the path to the destination files
    // will be wrote
    const faviconPath = path.resolve(dest, favicon.name)

    // add file to the list to return
    compiled.push(await write(faviconPath, favicon.contents))
  }

  // return compiled images
  return compiled
}