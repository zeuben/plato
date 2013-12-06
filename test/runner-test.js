'use strict';

var fs = require('fs');

var plato = require('../lib/plato');

/*
 ======== A Handy Little Nodeunit Reference ========
 https://github.com/caolan/nodeunit

 Test methods:
 test.expect(numAssertions)
 test.done()
 Test assertions:
 test.ok(value, [message])
 test.equal(actual, expected, [message])
 test.notEqual(actual, expected, [message])
 test.deepEqual(actual, expected, [message])
 test.notDeepEqual(actual, expected, [message])
 test.strictEqual(actual, expected, [message])
 test.notStrictEqual(actual, expected, [message])
 test.throws(block, [error], [message])
 test.doesNotThrow(block, [error], [message])
 test.ifError(value)
 */

exports['plato'] = {
  setUp: function(done) {
    // setup here
    done();
  },
  tearDown: function(done) {
    plato.removeAllListeners('*');
    done();
  },
  'test report runner' : function(test) {
    test.expect(1);

    var promise = plato.runSetup('plato-complexity-report').then(function(){
      return plato.runReport('plato-complexity-report', {
        file : 'file.js',
        source : 'var a = 2;',
        options : {}
      });
    });

    positiveTest(promise,test);

  },
  'test run' : function(test) {
    test.expect(1);

    var config = {
      files : 'test/fixtures/*.js',
      modules : ['plato-complexity-report'],
      output : 'tmp/',
      options : '',
      'plato-complexity-report' : {
        newmi : true
      }
    };

    var promise = plato.run(config);

    positiveTest(promise,test);

  },
  'test multiple runners and init directory' : function(test){
    test.expect(2);

    var config = {
      modules : [
        'plato-complexity-report'
      ],
      files : [
        'test/fixtures/a.js',
        'test/fixtures/b.js',
        'test/fixtures/issue_16.js'
      ],
      output : 'tmp/foo'
    };

    plato.initDirectory(config).then(
      function(){
        var stat = fs.statSync(config.output);
        test.ok(stat.isDirectory());
        var promise = plato.runReports(config);

        var expected = config.files.length, num = 0, inc = function(){ num++; };

        plato.on('report:detail:generated', inc);

        promise.then(
          function(){
            test.equal(num, expected, expected + ' events should have been generated');
            test.done();
          },function(err){
            console.log(err.stack);
            test.ok(false);
            test.done();
          }
        );
      },
      function(){
        test.ok(false);
        test.done();
      }
    );

  }
};

function positiveTest(promise,test) {
  promise.then(
    function(){
      test.ok(true);
      test.done();
    },
    function(err){
      console.log(err.stack);
      test.ok(false);
      test.done();
    }
  );
}

function negativeTest(promise,test) {
  promise.then(
    function(){
      test.ok(false);
      test.done();
    },
    function(){
      test.ok(true);
      test.done();
    }
  );
}
