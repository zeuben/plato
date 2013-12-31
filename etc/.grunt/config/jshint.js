module.exports = {
  options: {
    jshintrc: 'etc/.jshintrc'
  },
  gruntfile: {
    src: 'Gruntfile.js'
  },
  lib: {
    src: ['lib/**/*.js', '!lib/assets/**/*.js']
  },
  test: {
    src: ['test/**/*.js','!test/fixtures/**/*.js'],
    options : {
      jshintrc: 'etc/.test.jshintrc'
    }
  },
  client: {
    src: ['client-src/js/**/*.js','!client-src/js/vendor/**/*.js']
  }
};
