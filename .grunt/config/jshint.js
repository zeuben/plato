module.exports = {
  options: {
    jshintrc: '.jshintrc'
  },
  gruntfile: {
    src: 'Gruntfile.js'
  },
  lib: {
    src: ['lib/**/*.js', '!lib/assets/**/*.js']
  },
  test: {
    src: ['test/**/*.js','!test/fixtures/**/*.js']
  },
  client: {
    src: ['client-src/js/**/*.js','!client-src/js/vendor/**/*.js']
  }
};