import { isProd, loadRC, resolveOutput } from '../workspace'
import Bundler from 'parcel-bundler'
import plugins from './parcel/plugins'
import path from 'path'


/**
 * Compile many JS files
 * @param {Object} ctx
 * @param {Array<String>} ctx.files
 * @param {String} ctx.base subfolder
 * @param {String} ctx.dest folder
 * @param {Object} config
 */
export default async function({ files, base, dest }, config) {

  // get .parcelrc
  const rc = loadRC('parcel', {
    alias: {
      '@/': config.input
    }
  })

  // resolve alias path
  for(let alias in rc.alias) {
    rc.alias[alias] = path.resolve(rc.alias[alias])
  }

  // compile files
  const compiled = []
  for(let file of files) {

    // resolve output filename
    const { outdest, outname } = resolveOutput(file, base, dest)

    // init bundle as build-only (no watch, cache or hash)
    const bundler = new Bundler(file, {
      outDir: outdest,
      outFile: outname,
      watch: false,
      cache: false,
      contentHash: false,
      minify: isProd,
      sourceMaps: true,
      autoInstall: false,
      killWorkers: true,
      logLevel: 2,
      ...rc
    })

    // add built-in plugins
  for(let i = plugins.length; i--;) {
    plugins[i](rc)(bundler)
  }

    // generate files
    const bundle = await bundler.bundle()
    for(let b of bundle.entryAsset.bundles) {
      compiled.push({ filename: b.name, size: b.totalSize })
    }
  }

  return compiled
}