# Forge

Zero-based configuration builder for frontend integration project, made for those you want:
- a builder made for static website, working out-of-the-box with no config needed
- control over the source, the compilation and the destination, unlike Webpack
- extendable low-level vanilla tasks instead of the Gulp stream-thing
- preconfigured well-known libs such as `sass`, `babel`, `parcel` or `twig`
- no black magic


## Install

```
npm install @wide/forge --save-dev
```


## Usage

- [Commands](#commands)
- [Minimal folder structure](#minimal-folder-structure)
- [HTML / TWIG](#html--twig)
- [CSS / SASS](#css--sass)
- [JS / ESNEXT](#js--esnext)
- [Other assets](#other-assets)
- [Advanced usage](#advanced-usage)


## Commands

**Global commands**
- start server and watch changes: `forge serve --open`
- build project for production: `forge build --production`

**Specific commands**
- clear dist folder: `forge nuke`
- compile specific assets: `forge compile scss js`
- copy static assets to dist: `forge copy`


## Minimal folder structure

**Forge** needs a specific folder structure in order to work without configuration:
```
src/
  assets/
    icons/*.svg
    scss/*.scss
    js/*.js
  *.twig
```

will be compiled into:
```
dist/
  assets/
    sprite.svg
    *.css
    *.js
  *.html
```


## HTML / TWIG

- source files: `/src/**.twig`
- destination: `/dist/**.html`
- compiled using [`twig`](https://www.npmjs.com/package/twig)

### Path config

To change the path config, create a `.forgerc.js` file at the root of your project with a `twig` prop:
```js
module.exports = {
  twig: {

    // in /src, files to watch, will trigger the compilation when changed
    observe: '**/*.{twig,html}',

    // in src/, files to compile, must be pages only
    entries: [
      '**.twig',
      '!layouts/',
      '!components/'
    ],

    // in dist/, subfolder to generate HTML files into
    output: ''
  }
}
```

### Twig config

To edit the config of `twig` itself, create a `.twigrc.js` file at the root of your project, it accepts the following props:
```js
module.exports = {

  // alias of path, see https://github.com/twigjs/twig.js/wiki#namespaces
  namespace: {
    'foo': 'src/foo' // {% include 'foo::index.twig' %} => {% include '/src/foo/index.twig' %}
  },

  // global data injected in all templates
  data: {
    foo: 'bar' // {{ foo }}
  },

  // custom functions, see https://github.com/twigjs/twig.js/wiki/Extending-twig.js
  functions: {
    foo() {} // {% foo() %}
  },

  // custom filters, see https://github.com/twigjs/twig.js/wiki/Extending-twig.js
  filters: {
    foo() {} // {% myvar | foo %}
  },

  // post-process middlewares
  postprocess: {
    beautify: true, // built-in post-process
    foo(html) {     // custom post-process
      return doSomething(html)
    }
  }
}
```

Notes:
- `postprocess`: **Forge** comes with a set of post-process to enhance the quality of the generated HTML:
  - `beautify`: use [`js-beautify`](https://www.npmjs.com/package/js-beautify) to format the whole page, accepts these values:
    - `false` disable the post-process
    - `true` enable the post-process (default)
    - `{}` enable and pass custom config


## CSS / SASS

- source files: `/src/assets/**/*.{sass,scss}`
- destination: `/dist/assets/*.css` and `/dist/assets/*.css.map`
- compiled using [`sass`](https://www.npmjs.com/package/sass)

### Path config

To change the path config, create a `.forgerc.js` file at the root of your project with a `sass` prop:
```js
module.exports = {
  sass: {

    // in /src, files to watch, will trigger the compilation when changed
    observe: '**/*.{scss,sass}',

    // in src/, files to compile, must be root level only
    entries: [
      'assets/{scss,sass}/*.{scss,sass}'
    ],

    // in dist/, subfolder to generate CSS files into
    output: 'assets/'
  }
}
```

### SASS config

To edit the config of `sass` itself, create a `.sassrc.js` file at the root of your project, it accepts the following props:
```js
module.exports = {

  // path to look-up
  includePaths: [],

  // enable of disable minification, see https://github.com/sass/node-sass#outputstyle
  outputStyle,

  // post-process middlewares
  postprocess: {
    autoprefixer: false, // built-in post-process
    foo(css) {           // custom post-process
      return doSomething(css)
    }
  },

  // ... and all others props described here:
  // https://github.com/sass/node-sass#options
}
```

Notes:
- `includePaths` includes `node_modules/` by default
- `outputStyle` is `compressed` on `PRODUCTION` by default
- `postprocess`: **Forge** comes with a set of post-process to enhance the quality of the generated CSS
  - `autoprefixer`: use [`autoprefixer`](https://www.npmjs.com/package/autoprefixer) to add browser-specific prefixes:
    - `false` disable the post-process
    - `true` enable the post-process (default)
    - `{}` enable and pass custom config, see [official doc](https://www.npmjs.com/package/autoprefixer#options)


## JS / ESNEXT

- source files: `/src/assets/**/*.js`
- destination: `/dist/assets/*.js` and `/dist/assets/*.js.map`
- compiled using [`parcel`](https://github.com/parcel-bundler/parcel)

### Path config

To change the path config, create a `.forgerc.js` file at the root of your project with a `js` prop:
```js
module.exports = {
  js: {

    // in /src, files to watch, will trigger the compilation when changed
    observe: '**/*.js',

    // in src/, files to compile, must be root level only
    entries: [
      'assets/js/*.js',
      '!assets/js/polyfills/**.js' // polyfills have a separate config
    ],

    // in dist/, subfolder to generate JS files into
    output: 'assets/'
  }
}
```

### Parcel config

To edit the config of `parcel` itself, create a `.parcelrc.js` file at the root of your project:
```js
module.exports = {
  // all props described here:
  // https://parceljs.org/api.html
}
```

Notes:
- `outDir` and `outFile` are reserved, do not change
- `watch`, `cache`, `contentHash` and `autoinstall` must remain `false`
- `minify` is `true` on `PRODUCTION` by default
- this file is for advanced users, don't mess up :D

### Babel config

Parcel is using `babel` to transpile ES standards, to edit the config of `babel`, create a `.babelrc.js` file at the root of your project:
```js
module.exports = {
  // all props described here:
  // https://babeljs.io/docs/en/6.26.3/babelrc
}
```


## SVG SPRITE

- source files: `/src/assets/icons/*.svg`
- destination: `/dist/assets/sprite.svg`
- compiled using [`svg-sprite`](https://www.npmjs.com/package/svg-sprite)

### Path config

To change the path config, create a `.forgerc.js` file at the root of your project with a `svg` prop:
```js
module.exports = {
  svg: {

    // in /src, files to watch, will trigger the compilation when changed
    observe: '**/*.svg',

    // in src/, files to compile, must be root level only
    entries: [
      'assets/icons/*.svg'
    ],

    // in dist/, subfolder to generate the sprite file into
    output: 'assets/'
  }
}
```

### SVG-Sprite config

To edit the config of `svg-sprite` itself, create a `.svgrc.js` file at the root of your project:
```js
module.exports = {
  // all props described here:
  // https://www.npmjs.com/package/svg-sprite#configuration-basics
}
```

Notes:
- `dest` is reserved, do not change
- `mode.symbol.sprite` is `sprite.svg` by default
- `mode.exemple` is `false` on `PRODUCTION` by default


## Other assets

For all others assets (images, documents...), **Forge** simply copy them into the `dist/` folder.

- source files: `/src/assets/**`
- destination: `/dist/assets/**`

### Path config

To change the path config, create a `.forgerc.js` file at the root of your project with a `copy` prop:
```js
module.exports = {
  copy: {

    // in src/, files to copy
    entries: [
      'assets/**',
      // exclude compiled assets
      '!assets/icons/**',
      '!assets/scss/**',
      '!assets/js/**'
    ]
  }
}
```


## Advanced usage

### Add a compiler

To add a new asset compiler, like Handlebars, follow this exemple:
```js
.forgerc.js
{

  // add a new hbs compiler
  compilers: {
    
    /**
     * Compile handlebars templates
     * @param {Object} ctx
     * @param {Array}  ctx.files to compile into HTML
     * @param {String} ctx.base relative path from wildcard (ex: templates/pages/**.hbs -> templates/pages/foo/bar.hbs -> foo/)
     * @param {String} ctx.dest folder (output + hbs.output -> dist/) 
     * @return {Array<Object>} the list of generated files with their octal size [{ filename, size }]
     */
    hbs({ files, base, dest }) {
      return [{
        filename: 'compiled-file.html',
        size: 1024
      }]
    }

  },

  // rewrite targets to replace twig with hbs
  targets: ['hbs', 'scss', 'js', 'svg'],

  // define hbs target config
  hbs: {
    observe: '**/*.{hbs,html}',
    entries: [
      '**.hbs',
      '!layouts/',
      '!components/'
    ],
    output: ''
  }
}
```

### Add a command

To add a command not related to compilation, follow this exemple:
```js
.forgerc.js
{
  commands: {
    sayhello(argv) {
      console.log('Hello', ...argv._)
    }
  }
}
```

Then the command is available using:
```bash
forge sayhello you # Hello you
```


## Authors

- **Aymeric Assier** - [github.com/myeti](https://github.com/myeti)
- **Julien Martins Da Costa** - [github.com/jdacosta](https://github.com/jdacosta)


## License

This project is licensed under the MIT License - see the [licence](licence) file for details