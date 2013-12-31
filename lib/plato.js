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
    glob = require('glob'),
    resolve = require('resolve');

// plato lib
var util = require('./util'),
    Logger = require('./logger'),
    Component = require('./component');

var log = new Logger(Logger.DEBUG);

var defaults = {
  modules : [
    'plato-complexity-report'
  ],
  db : '.plato.db'
};

var plato = module.exports = new EventEmitter2({ wildcard : true });

plato.Component = Component;

/* Common entry point to plato */
plato.run = function(config){
  var job;

  _.defaults(config, defaults);

  log.debug('Initial options', config);

  job = plato.verifyConfig(config);

  if (config.output) {
    job = job.then(plato.initDirectory)
             .then(plato.getComponents)
//             .then(plato.writeComponents)
             .then(plato.writeConfig);
  }

  return job.then(plato.initDb)
             .then(plato.getFiles)
             .then(plato.runReports)
             .catch(function(err){ log.error(err.stack); });
};

/* Verify sane config settings */
plato.verifyConfig = function(config) {
  log.debug('Verifying configuration structure');

  if (!config.files) config.files = [];
  if (!(config.files instanceof Array)) config.files = [ config.files ];

  return Q.resolve(config);
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
        .then(qfs.makeTree.bind(qfs, path.join(dir,'components')))
        .then(qfs.makeTree.bind(qfs, path.join(dir,'source')))
        .then(qfs.makeTree.bind(qfs, path.join(dir,'reports')))
        .then(deferred.resolve.bind(deferred, config),deferred.reject);
    });

  return deferred.promise;
};

/* Get components from configured modules */
plato.getComponents = function(config) {
  var deferred = Q.defer();

  var modules = config.modules.concat(path.join(__dirname,'..','components'));

  var components = _.flatten(modules.map(function(module){
    module = require(module);

    // if the module has a `registerComponents` method, run it
    if (module.registerComponents) return module.registerComponents(plato);

    // otherwise return nothing
    return [];
  }));

  config.components = components;

  Q.all(components.map(function(component){
      return component.readFiles().then(function(sources){
        return Q.all([
          qfs.write(path.join(config.output, 'components', component.name() + '.js'), sources[0]),
          qfs.write(path.join(config.output, 'components', component.name() + '.css'), sources[1])
        ]);
      });
    })).then(
    deferred.resolve.bind({},config),
    deferred.reject
  );

  return deferred.promise;
};

/* Write components out as concatenated files */
plato.writeComponents = function(config) {
  var deferred = Q.defer();

  var writes = config.components.map(function(component){
    return qfs.write(path.join(config.output, 'components', component.name + ".js"), component.src);
  });

  Q.all(writes).then(deferred.resolve.bind({}, config), deferred.reject);

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

/* require any visual components we have been configured for */
plato.registerComponents = function(module) {
  var deferred = Q.defer();

  // if we don't start with a dot or slash, assume we are looking for a module's components
  // hence require('module/components');
  if (!module.match(/^(\.|\/|\\)/)) module = path.join(module, 'components');

  resolve(module, { basedir: __dirname }, function(err, path){
    if (err) return deferred.reject(err);
    var moduleComponents = require(path)(plato);
    deferred.resolve(moduleComponents instanceof Array ? moduleComponents : [moduleComponents]);
  });


  return deferred.promise;
};

/* Get the files matched by config.files pattern */
plato.getFiles = function(config){
  var deferred = Q.defer();

  log.debug('Retrieving files based on patterns : ', config.files);

  var globPromise = Q.denodeify(glob);

  // can't use the above in a map due to the extra args, hence :
  var globEach = function(file) { return globPromise(file); };

  Q.all(config.files.map(globEach)).then(function(files){
    config.files = _.flatten(files);
    if (config.files.length) return deferred.resolve(config);
    deferred.reject(new Error('No files found to report on.'));
  });

  return deferred.promise;
};

/* Run all reports across all files */
plato.runReports = function(config){
  var deferred = Q.defer();

  var reportsAggregate = config.reports = { files : {} };

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
        reportsAggregate.files[file] = reportsAggregate.files[file] || {};
        // if our report is not broken up into summary/detail, use the same for both
        if (report && !('detail' in report)) {
          reportDetail[module] = reportsAggregate.files[file][module] = report;
        } else {
          reportDetail[module] = report.detail;
          reportsAggregate.files[file][module] = report.summary;
        }
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

    if (config.output) filePromise.then(writeFile,log.warning);

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
  /*jshint newcap:false*/
  var promise;

  // if we didn't pass in the source with the options
  if (futureFile) {
    promise = futureFile.then(function(source){
      options.source = source;
      return Q(require(module).process(options));
    });
  } else {
    promise = Q(require(module).process(options));
  }
  /*jshint newcap:false*/

  promise.then(function(report){
    plato.emit('report:detail:generated', module, report);
  });

  return promise;
};

/* Get aggregate report for a module */
plato.getAggregateReport = function(module, options){
  /*jshint newcap:false*/

  var promise = Q(require(module).aggregate(options));

  promise.then(function(report){
    plato.emit('report:aggregate:generated', module, report);
  });

  return promise;
};

/* Run external modules .setup() */
plato.runSetup = function(module, options){
  /*jshint newcap:false*/

  var promise = Q(require(module).setup(options));

  promise.then(function(report){
    plato.emit('report:setup', module);
  });

  return promise;
};

/* Run external modules .teardown() */
plato.runTeardown = function(module, options){
  /*jshint newcap:false*/

  var promise = Q(require(module).teardown(options));

  promise.then(function(report){
    plato.emit('report:teardown', module);
  });

  return promise;
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

