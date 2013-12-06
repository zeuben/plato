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

var plato = module.exports = new EventEmitter2({ wildcard : true });

/* Common entry point to plato */
plato.run = function(config){

  _.defaults(config, defaults);

  var job = plato.initDirectory(config)
              .then(plato.writeConfig)
              .then(plato.initDb)
              .then(plato.getFiles)
              .then(plato.runReports)
              .catch(function(err){
                log.error(err)
              })
              ;

  return job;
};

/* Get the files matched by config.files pattern */
plato.getFiles = function(config){
  var deferred = Q.defer();

  config.files = config.files instanceof Array ? config.files : [config.files];

  var globPromise = Q.denodeify(glob);

  // can't use the above in a map due to the extra args, hence :
  var globEach = function(file) { return globPromise(file); }

  Q.all(config.files.map(globEach)).spread(function(/* var args */){
    config.files = _.flatten(arguments);
    deferred.resolve(config);
  });

  return deferred.promise;
};

/* Run all reports across all files */
plato.runReports = function(config){
  var deferred = Q.defer();

  var reportsAggregate = config.reports = {};

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

    var moduleReports = config.modules.map(runReport);

    return Q.allSettled(moduleReports).then(writeDetail);
  }

  function setupModules() {
    return Q.allSettled(config.modules.map(function(module){
      log.debug('Running module setup for ' + module);
      return plato.runSetup(module, config);
    }));
  }

  function teardownModules() {
    return Q.allSettled(config.modules.map(function(module){
      log.debug('Running module teardown for ' + module);
      return plato.runTeardown(module, config);
    }));
  }

  function gatherDetail() {
    log.debug('Gathering detail reports.');
    return Q.allSettled(config.files.map(gatherReports));
  }

  function gatherAggregate() {
    log.debug('Gathering aggregate reports.');
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
    .then(deferred.resolve.bind({}, config),deferred.reject);

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

/* Get aggregate report for a module */
plato.getAggregateReport = function(module, options){
  var deferred = Q.defer();

  require(module).aggregate(options, deferred);

  deferred.promise.then(function(report){
    plato.emit('report:aggregate:generated', module, report);
  });

  return deferred.promise;
};

/* Run external modules .setup() */
plato.runSetup = function(module, options){
  var deferred = Q.defer();

  require(module).setup(options, deferred);

  deferred.promise.then(function(report){
    plato.emit('report:setup', module);
  });

  return deferred.promise;
};

/* Run external modules .teardown() */
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

  log.debug('Initializing output directory ' + dir);

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

/* Write config as an AMD module for the client */
plato.writeConfig = function(config) {
  var deferred = Q.defer();

  var json = JSON.stringify(config, null, 2);
  var module = 'define(' + json + ')';

  qfs.write(path.join(config.output, 'config.js'), module)
    .then(deferred.resolve.bind({}, config), deferred.reject);

  return deferred.promise;
};

