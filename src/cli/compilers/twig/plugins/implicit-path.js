import path from 'path'


/**
 * On "extends", "include" or "embed", load implicit path such as:
 * - [file].twig (when no extension is provided)
 * - [file]/index.twig
 */
export default (core) => {

  // keep initial file loader
  const fsLoader = core.Templates.loaders.fs.bind(core.Templates)

  // override file loader
  core.Templates.registerLoader('fs', function(location, params, fn, errfn) {

    // ensure .twig extension when no one is provided
    try {
      const ext = path.extname(location)
      if(!ext) {
        location = params.id = `${location}.twig`
      }
      return fsLoader(location, params, fn, errfn)
    }
    // [file] and [file].twig dont exist, try looking for [file]/index.twig
    catch(error) {
      try {
        const ext = path.extname(location)
        const dirname = path.dirname(location)
        const basename = path.basename(location, ext)
        params.id = params.path = path.join(dirname, basename, `index${ext}`)
        return fsLoader(params.id, params, fn, errfn)
      }
      // [file]/index.twig does not exists neither, throw initial error
      catch(error2) {
        throw error
      }
    }
  })
}