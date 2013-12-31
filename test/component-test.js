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
  '' : function(test) {
    var component = new Component()
      .name('foo');

    test.equal(component.name(), 'foo', 'should set the property appropriately');
    test.done();
  },
  'component registration' : function(test) {

    var component = new Component()
      .name('foo')
      .basedir(__dirname)
      .source(['fixtures/a.js', 'fixtures/b.js'])
      .styles(['fixtures/c.css']);

    component.readFiles().then(
      function(concatenatedFiles){
        test.equal(concatenatedFiles.length, 2, 'should return two strings');
        test.equal(concatenatedFiles[0].length, 269, 'should haven concatenated source');
        test.equal(concatenatedFiles[1].length, 27, 'should haven concatenated styles');
        test.done();
      },
      function(err) {
        test.ok(false);
        test.done();
      }
    );
  }
};

