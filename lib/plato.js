/*
 * plato
 * https://github.com/es-analysis/plato
 *
 * Copyright (c) 2012 Jarrod Overson
 * Licensed under the MIT license.
 */

'use strict';

// node lib
var path = require('path');

// vendor lib
var Q = require('q'),
    qfs = require('q-io/fs'),
    Datastore = require('nedb'),
    _ = require('lodash'),
    EventEmitter2 = require('eventemitter2').EventEmitter2,
    glob = require('glob');

// plato lib
var util = require('./util'),
    Logger = require('./logger');

var log = new Logger(Logger.DEBUG);

var defaults = {
  modules : [
    'plato-complexity-report'
  ],
  output : 'reports',
  db : '.plato.db'
};

var plato = new EventEmitter2({ wildcard : true });

module.exports = plato;

/* Common entry point to plato */
plato.run = function(config){

  _.defaults(config, defaults);

  var job = plato.initDirectory(config)
              .then(plato.initDb)
              .then(plato.getFiles)
              .then(plato.runReports)
              ;

  return job;
};

/* Get the files matched by config.files pattern */
plato.getFiles = function(config){
  var deferred = Q.defer();

  var options = {};

  glob(config.files, options, function (err, files) {
    if (err) return deferred.reject(err);
    config.files = files;
    deferred.resolve(config);
  });

  return deferred.promise;
};

/* Run all reports across all files */
plato.runReports = function(config){
  var deferred = Q.defer();

  var reportsAggregate = {};

  function gatherReports(file) {
    log.debug('Gathering reports for ' + file);
    var reportDetail = {};
    var safename = util.normalizeFilename(file);
    var filePromise = qfs.read(file);

    // write source out to file for client display
    function writeFile(source) {
      log.debug('Writing source for ' + file);

      var data = {
        filename : file,
        source : source
      };

      var outfile = path.join(config.output, 'source', safename);
      var json = JSON.stringify(data);
      json = 'define(' + json + ');';
      return qfs.write(outfile + '.js', json);
    }

    function runReport(module) {
      log.debug('Running report "' + module + '" for ' + file);

      var reportConfig = {
        safename : safename,
        link : safename,
        filename : file,
        options : config[module] || {}
      };

      var promise = plato.runReport(module, reportConfig, filePromise);

      promise.then(function(report){
        reportDetail[module] = report;
      });

      return promise;
    }

    function writeDetail() {
      log.debug('Writing detail report for ' + file);

      var outfile = path.join(config.output, 'reports', safename + '-detail.js');
      var json = JSON.stringify(reportDetail);
      json = 'define(' + json + ');';
      return qfs.write(outfile, json);
    }

    filePromise.then(writeFile,log.warning);

    var modules = config.modules.map(runReport);

    return Q.allSettled(modules).then(writeDetail);
  }

  function setupModules() {
    log.debug('Running module setup for ' + module);
    return Q.allSettled(config.modules.map(function(module){
      return plato.runSetup(module, config);
    }));
  }

  function teardownModules() {
    log.debug('Running module teardown for ' + module);
    return Q.allSettled(config.modules.map(function(module){
      return plato.runTeardown(module, config);
    }));
  }

  function gatherDetail() {
    log.debug('Gathering detail reports ' + module);
    return Q.allSettled(config.files.map(gatherReports));
  }

  function gatherAggregate() {
    log.debug('Gathering aggregate reports ' + module);
    return Q.allSettled(config.modules.map(getAggregate));
  }

  function getAggregate(module) {
    log.debug('Running aggregate report for "' + module + '"');

    var reportConfig = {
      options : config[module] || {}
    };

    var promise = plato.getAggregateReport(module, reportConfig).then(
      function(report){ reportsAggregate[module] = report; }
    );

    return promise;
  }

  function writeAggregate(report) {
    var outfile = path.join(config.output, 'reports', 'aggregate.js');
    log.debug('Writing aggregate report to ' + outfile);
    var json = JSON.stringify(reportsAggregate);
    json = 'define(' + json + ');';
    return qfs.write(outfile, json);
  }

  setupModules()
    .then(gatherDetail)
    .then(gatherAggregate)
    .then(writeAggregate)
    .then(teardownModules)
    .then(deferred.resolve.bind({}, reportsAggregate),deferred.reject);

  return deferred.promise;
};


/* Run an individual report on an individual file */
plato.runReport = function(module, options, futureFile){
  var deferred = Q.defer();

  // if we didn't pass in the source with the options
  if (futureFile) {
    futureFile.then(function(source){
      options.source = source;
      require(module).process(options, deferred);
    });
  } else {
    require(module).process(options, deferred);
  }

  deferred.promise.then(function(report){
    plato.emit('report:detail:generated', module, report);
  });
  return deferred.promise;
};

plato.getAggregateReport = function(module, options){
  var deferred = Q.defer();

  require(module).aggregate(options, deferred);

  deferred.promise.then(function(report){
    plato.emit('report:aggregate:generated', module, report);
  });

  return deferred.promise;
};

plato.runSetup = function(module, options){
  var deferred = Q.defer();

  require(module).setup(options, deferred);

  deferred.promise.then(function(report){
    plato.emit('report:setup', module);
  });

  return deferred.promise;
};

plato.runTeardown = function(module, options){
  var deferred = Q.defer();

  require(module).teardown(options, deferred);

  deferred.promise.then(function(report){
    plato.emit('report:teardown', module);
  });

  return deferred.promise;
};

/* Initialize/open database */
plato.initDb = function(config){
  var deferred = Q.defer();

  var file = config.db;

  config.dbi = new Datastore({ filename: file });

  config.dbi.loadDatabase(function(err){
    if (err) return deferred.reject(err);
    deferred.resolve(config);
  });

  return deferred.promise;
};

/* Initialize directory structure for output dir */
plato.initDirectory = function(config) {
  var deferred = Q.defer();

  var dir = config.output;

  qfs.exists(dir)
    .then(qfs.removeTree.bind(qfs, dir))
    .finally(function(){
      qfs.copyTree(path.join(__dirname, '..', 'client-src'), dir)
        .then(qfs.makeTree.bind(qfs, path.join(dir,'source')))
        .then(qfs.makeTree.bind(qfs, path.join(dir,'reports')))
        .then(deferred.resolve.bind(deferred, config),deferred.reject);
    });

  return deferred.promise;
};


