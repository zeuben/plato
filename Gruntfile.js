'use strict';

var path = require('path');

module.exports = function(grunt) {

  require('load-grunt-config')(grunt, {
    configPath: path.join(process.cwd(), 'etc', '.grunt', 'config'),
    loadGruntTasks: {
      pattern: 'grunt-*',
      config: require('./package.json'),
      scope: 'devDependencies'
    }
  });

//  grunt.registerTask('runtest',function(){
//    var done = this.async();
//
//    grunt.util.spawn({
//        cmd : './bin/plato',
//        args : [
//          '-q',
//          '-dtmp',
//          '-ttest report',
//          'test/fixtures/a.js','test/fixtures/b.js','test/fixtures/empty.js'
//        ]
//      },
//      function(err, result, code){
//        console.log(result.stdout);
//        console.log(result.stderr);
//        if (err || code !== 0) {
//          grunt.fatal('Running plato binary failed');
//        }
//        done();
//      }
//    );
//  });
//
  grunt.registerTask('runbin',function(){
    var done = this.async();

    grunt.util.spawn({
        cmd : './bin/plato'
      },
      function(err, result, code){
        console.log(result.stdout);
        if (err || code !== 0) {
          console.log(err);
          grunt.fatal('Running plato binary failed');
        }
        done();
      }
    );
  });

  grunt.registerTask('dev', [
    'test',
    'build',
    'watch'
  ]);

  grunt.registerTask('test', [
    'jshint',
    'nodeunit',
    'runbin'
  ]);

  grunt.registerTask('build', [
    'sass'
  ]);

  grunt.registerTask('default', ['test']);

};
