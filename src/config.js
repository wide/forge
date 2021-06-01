export default {

  input: 'src/',
  output: 'dist/',
  targets: ['twig', 'sass', 'js', 'polyfills', 'svg', 'favicons'],
  
  twig: {
    observe: '**/*.{twig,html}',
    entries: '**.twig',
    exclude: [
      'layouts/**.twig',
      'components/**.twig'
    ],
    output: ''
  },

  sass: {
    observe: '**/*.{scss,sass}',
    entries: 'assets/{scss,sass}/*.{scss,sass}',
    output: 'assets/'
  },

  js: {
    observe: '**/*.js',
    entries: 'assets/js/*.js',
    exclude: ['assets/js/polyfills/**.js'],
    output: 'assets/'
  },

  polyfills: {
    compiler: 'js',
    observe: 'assets/js/polyfills/**/*.js',
    entries: 'assets/js/polyfills/**.js',
    output: 'assets/polyfills'
  },

  favicons: {
    observe: 'assets/favicon.png',
    entries: 'assets/favicon.png',
    output: 'assets/favicons'
  },

  svg: {
    observe: '**/*.svg',
    entries: 'assets/icons/*.svg',
    output: 'assets/'
  },

  copy: {
    entries: [
      'assets/**'
    ],
    exclude: [
      'assets/icons/**',
      'assets/scss/**',
      'assets/js/**'
    ],
    output: ''
  }

}