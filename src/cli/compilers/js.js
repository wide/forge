import { isProd, loadRC, resolveOutput } from '../workspace'
import Bundler from 'parcel-bundler'
import plugins from './parcel/plugins'
import path from 'path'


/**
 * Compile many JS files
 * @param {Object} ctx
 * @param {Object} config
 * @param {Object} targetConfig
 */
export default async function(ctx, config, targetConfig) {

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
  for(let file of ctx.files) {
    const stats = await compile(file, ctx, targetConfig, rc)
    compiled.push(...stats)
  }

  return compiled
}


/**
 * Compile one TWIG file
 * @param {String} file path
 * @param {Object} ctx
 * @param {Object} targetConfig
 * @param {Object} rc 
 */
async function compile(file, ctx, targetConfig, rc) {

  // resolve output filename
  const { outdest, outname } = resolveOutput(file, ctx, targetConfig)

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
  const bundled = []
  const bundle = await bundler.bundle()
  for(let b of bundle.entryAsset.bundles) {
    bundled.push({ filename: b.name, size: b.totalSize })
  }

  return bundled
}