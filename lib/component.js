
'use strict';

var path = require('path');

var qfs = require('q-io/fs'),
    Q = require('Q');

module.exports = Component;

function Component(name, basedir, files) {

  this.name = name;
  this.files = files instanceof Array ? files : [ files ];

  this.promise = this.catFiles(basedir, this.files).then(function(src){
    this.src = src;
  }.bind(this));

}

Component.prototype.toString = function() {
  return this.name;
};

Component.prototype.toJSON = function() {
  return this.name;
};

Component.prototype.catFiles = function(basedir, files) {
  var deferred = Q.defer();

  var fileMap = files.map(function(file){
    return qfs.read(path.join(basedir, file));
  });

  Q.all(fileMap).spread(function(/*varargs*/){
    var src = '';
    for (var i = 0; i < arguments.length; i++) {
      src += arguments[i];
    }
    deferred.resolve(src);
  }, deferred.reject);

  return deferred.promise;
};

