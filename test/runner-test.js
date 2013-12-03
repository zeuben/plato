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

    var promise = plato.runReport('plato-complexity-report', {
      file : 'file.js',
      source : 'var a = 2;',
      options : {}
    });

    positiveTest(promise,test);

  },
  'test run' : function(test) {
    test.expect(1);

    var config = {
      files : 'test/fixtures/*.js',
      modules : ['plato-complexity-report'],
      output : 'tmp/',
      options : ''
    };

    var promise = plato.run(config);

    positiveTest(promise,test);

  },
//  'test init Directory' : function(test) {
//    test.expect(2);
//
//    var dir = 'tmp';
//
//    var promise = plato.initDirectory({output : dir});
//
//    promise.then(
//      function(){
//        var stat = fs.statSync(dir);
//        test.ok(stat.isDirectory(dir));
//        positiveTest(promise,test);
//      }
//    );
//  },
  'test multiple runners' : function(test){
    test.expect(1);

    var config = {
      modules : [
        'plato-complexity-report'
      ],
      files : [
        'test/fixtures/a.js'
      ],
      output : 'tmp'
    };

    var promise = plato.runReports(config);

    var expected = config.files.length, num = 0, inc = function(){ console.log('foo'); num++; };

    plato.on('report:generated', inc);

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
