module.exports = {
  gruntfile: {
    files: 'Gruntfile.js',
    tasks: ['jshint:gruntfile']
  },
  test: {
    files: ['<%= jshint.test.src %>', 'lib/**/*.js'],
    tasks: ['jshint:test', 'nodeunit', 'runbin']
  },
  client_src: {
    files: ['<%= jshint.client.src %>'],
    tasks: ['jshint:client']
  },
  sass_foundation : {
    files: ['client-src/scss/foundation/**/*.scss'],
    tasks: ['sass:foundation']
  },
  sass_normalize : {
    files: ['client-src/scss/foundation/normalize.scss'],
    tasks: ['sass:normalize']
  },
  sass_main : {
    files: ['client-src/scss/main.scss','client-src/scss/plato/**/*.scss'],
    tasks: ['sass:main']
  },
  sass_charts : {
    files: ['client-src/scss/plato-charts.scss','client-src/scss/plato-charts/**/*.scss'],
    tasks: ['sass:main']
  }
};
