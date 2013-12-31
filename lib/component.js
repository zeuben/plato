
'use strict';

var path = require('path');

var qfs = require('q-io/fs'),
    Q = require('Q');

module.exports = Component;

function Component() {

}

function setGenericProperty(property) {
  return function(value) {
    if (arguments.length === 0) return this['_' + property];
    this['_' + property] = value;
    return this;
  };
}

/* properties that will be set with the generic setter */
[
  'name',
  'source',
  'styles',
  'basedir'
].forEach(function(prop){
  Component.prototype[prop] = setGenericProperty(prop);
});

/* read all source files */
Component.prototype.readFiles = function() {
  return Q.all([
    this.catFiles(this._basedir, this._source),
    this.catFiles(this._basedir, this._styles)
  ]);
};

/* simple toString/JSON so it can be serialized for configs */
Component.prototype.toString = Component.prototype.toJSON = function() { return this._name; };

/* gather and concatenate source files */
Component.prototype.catFiles = function(basedir, files) {
  var deferred = Q.defer();

  files = files || [];

  var fileMap = files.map(function(file){
    return qfs.read(path.join(basedir, file));
  });

  console.log(basedir, files, fileMap);
  Q.all(fileMap).then(function(sources){
    deferred.resolve(sources.join("\n"));
  }, deferred.reject);

  return deferred.promise;
};

