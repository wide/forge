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
- [SVG Sprite](#svg-sprite)
- [Favicons](#favicons)
- [Other assets](#other-assets)
- [Advanced usage](#advanced-usage)


## Commands

**Global commands**
- start server and watch changes: `forge serve --open`
- build project for production: `forge build --production`

**Specific commands**
- clear dist folder: `forge nuke`
- compile specific assets: `forge compile sass js`
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

To changethe path config config, create/edit the `.forgerc.js` file at the root of your project:
```js
module.exports = {

  // override twig path config
  twig: {

    // files to watch in /src, will trigger the compilation when changed
    observe: '**/*.{twig,html}', // watch src/index.twig and src/foo/bar.twig

    // in src/, files to compile, should be pages only
    entries: [
      '**.twig',      // build all twig into html (root = pages)
    ],

    // do not compile twig file in layouts/ nor components/
    exclude: [
      'layouts/**.twig',
      'components/**.twig'
    ],

    // in dist/, subfolder to generate HTML files into
    // ex: pages ->  dist/pages/index.html
    output: '', // no subfolder -> dist/index.html

    // if true, build all file at dist level only
    // ex: src/foo/bar.twig -> dist/bar.twig (foo subfolder is ignored)
    flatten: false,

    // commands to execute around the compilation
    hooks: {

      // run before the compilation, can be a string "npm run something"
      // or a function receiving the current target and the compiled files
      before(target, compiled) {},

      // run after the compilation, can be a string "npm run something"
      // or a function receiving the current target and the compiled files
      after(target, compiled) {}
    }
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
- compiled using [`sass-embedded`](https://www.npmjs.com/package/sass-embedded)

### Path config

To change the path config, create a `.forgerc.js` file at the root of your project with a `sass` prop:
```js
module.exports = {
  sass: {

    // files to watch in /src, will trigger the compilation when changed
    observe: '**/*.{scss,sass}',

    // in src/, files to compile, must be root level only
    entries: [
      'assets/{scss,sass}/*.{scss,sass}'
    ],

    // in dist/, subfolder to generate CSS files into
    output: 'assets/', // -> dist/assets/main.css

    // if true, build all file at dist level only
    // ex: src/assets/foo/bar.scss -> dist/assets/bar.css (foo subfolder is ignored)
    flatten: false,

    // commands to execute around the compilation
    hooks: {

      // run before the compilation, can be a string "npm run something"
      // or a function receiving the current target and the compiled files
      before(target, compiled) {},

      // run after the compilation, can be a string "npm run something"
      // or a function receiving the current target and the compiled files
      after(target, compiled) {}
    }
  }
}
```

### SASS config

To edit the config of `sass` itself, create a `.sassrc.js` file at the root of your project, it accepts the following props:
```js
module.exports = {

  // path to look-up
  loadPaths: [],

  // enable of disable minification, see https://sass-lang.com/documentation/js-api/modules#OutputStyle
  style: 'compressed', // or 'expanded'

  // source map (by default enabled on dev instances)
  sourceMap: true,

  // post-process middlewares
  postprocess: {
    autoprefixer: false, // built-in post-process
    foo(css) {           // custom post-process
      return doSomething(css)
    }
  },

  // ... and all others props described here:
  // https://sass-lang.com/documentation/js-api/interfaces/Options
}
```

Notes:
- `loadPaths` includes `./` and `./node_modules/` by default
- `style` is `compressed` on `PRODUCTION` by default
- `sourceMap` is disabled on `PRODUCTION` by default
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

    // files to watch in /src, will trigger the compilation when changed
    observe: '**/*.js',

    // in src/, files to compile
    entries: [
      'assets/js/*.js', // build all root level files
    ],

    // exclude polyfills from compilation
    exclude: [
      'assets/js/polyfills/**.js'
    ]

    // in dist/, subfolder to generate JS files into
    output: 'assets/', // -> dist/assets/main.js

    // if true, build all file at dist level only
    // ex: src/assets/foo/bar.js -> dist/assets/bar.js (foo subfolder is ignored)
    flatten: false,

    // commands to execute around the compilation
    hooks: {

      // run before the compilation, can be a string "npm run something"
      // or a function receiving the current target and the compiled files
      before(target, compiled) {},

      // run after the compilation, can be a string "npm run something"
      // or a function receiving the current target and the compiled files
      after(target, compiled) {}
    }
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


## SVG Sprite

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
    output: 'assets/',

    // commands to execute around the compilation
    hooks: {

      // run before the compilation, can be a string "npm run something"
      // or a function receiving the current target and the compiled files
      before(target, compiled) {},

      // run after the compilation, can be a string "npm run something"
      // or a function receiving the current target and the compiled files
      after(target, compiled) {}
    }
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


## Favicons

- source files: `/src/assets/favicon.png`
- destination: `/dist/assets/favicons`
- compiled using [`favicons`](https://www.npmjs.com/package/favicons)

### Path config

To change the path config, create a `.forgerc.js` file at the root of your project with a `favicons` prop:
```js
module.exports = {
  favicons: {

    // in /src, files to watch, will trigger the compilation when changed
    observe: 'assets/favicon.png',

    // in src/, file to compile, must be root level only
    entries: 'assets/favicons.png',

    // in dist/, subfolder to generate the sprite file into
    output: 'assets/favicons/',

    // commands to execute around the compilation
    hooks: {

      // run before the compilation, can be a string "npm run something"
      // or a function receiving the current target and the compiled files
      before(target, compiled) {},

      // run after the compilation, can be a string "npm run something"
      // or a function receiving the current target and the compiled files
      after(target, compiled) {}
    }
  }
}
```

### Favicons config

To edit the config of `favicons` itself, create a `.faviconsrc.js` file at the root of your project:
```js
module.exports = {
  // all props described here:
  // https://github.com/itgalaxy/favicons#usage
}
```


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
      'assets/**'
    ],

    // ignore to-be-compiled assets
    exclude: [
      'assets/icons/**',
      'assets/scss/**',
      'assets/js/**'
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
      '**.hbs'
    ],
    exclude: [
      'layouts/**.hbs',
      'components/**.hbs'
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