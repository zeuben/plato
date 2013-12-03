module.exports = {
  gruntfile: {
    files: 'Gruntfile.js',
    tasks: ['jshint:gruntfile']
  },
  test: {
    files: ['<%= jshint.test.src %>', 'lib/**/*.js'],
    tasks: ['jshint:test', 'nodeunit']
  },
  sass_foundation : {
    files: ['client-src/scss/foundation/foundation**/*.scss'],
    tasks: ['sass:foundation']
  },
  sass_normalize : {
    files: ['client-src/scss/foundation/normalize.scss'],
    tasks: ['sass:normalize']
  },
  sass_main : {
    files: ['client-src/scss/main.scss','client-src/scss/plato/**/*.scss'],
    tasks: ['sass:main']
  }
};