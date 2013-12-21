'use strict';

var fs = require('fs');

var Component = require('../lib/component');

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
    done();
  },
  'component registration' : function(test) {

    var component = new Component('foo', __dirname, ['fixtures/a.js', 'fixtures/b.js']);

    component.promise.then(
      function(){
        test.equal(component.files.length, 2);
        test.ok(component.src);
        test.done();
      },
      function(err) {
        test.ok(false);
        test.done();
      }
    );
  }
};

