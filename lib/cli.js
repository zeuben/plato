'use strict';

// node
var fs = require('fs');

// vendor
var getopt = require('posix-getopt'),
    Q = require('q'),
    _ = require('lodash');

// local
var plato = require('./plato'),
    info = require('./info'),
    util = require('./util');

exports.exec = function(options) {
  if (options) {
    Object.keys(options).forEach(function(key) {
      if (!(key in exports.args)) exports.args[key] = options[key];
    });
  }

  var platoOptions = {};

  if (exports.args.files.length) platoOptions.files = exports.args.files;
  if (exports.args.o) platoOptions.output = exports.args.o.value;
  if (exports.args.q) platoOptions.quiet = exports.args.q.value;
  if (exports.args.t) platoOptions.title = exports.args.t.value;
  if (exports.args.x) platoOptions.exclude = exports.args.x.value;
  if (exports.args.D) platoOptions.date = exports.args.D.value;

  exports.args.c = exports.args.c || { value : '.platorc' };

  if (exports.args.c) {
    var platorc = {};
    if (typeof exports.args.c.value === 'string') {
      try {
        var json = fs.readFileSync(exports.args.c.value).toString();

        platorc = JSON.parse(util.stripComments(json));
        platoOptions = _.extend({}, platorc, platoOptions);
      } catch (e) {
        // no .platorc found, no big deal
      }
    }
  }

  if (platoOptions.exclude) platoOptions.exclude = new RegExp(platoOptions.exclude);

  return plato.run(platoOptions);
};

exports.options = require('./cli/options');

exports.args = parseArgs(exports.options);


function parseArgs(options) {//  \/\\*(?:(?!\\*\/)|.|\\n)*?\\*\/
  var optionString = '',
      required = [],
      modal = false;

  Object.keys(options).forEach(function(option){
    var def = options[option];
    optionString += option;
    if (def.type === 'String') optionString += ':';
    if (def.long) optionString += '(' + def.long + ')';
    if (def.required) required.push(option);
  });

  var parser = new getopt.BasicParser(optionString, process.argv);
  var args = {}, option;

  while ((option = parser.getopt())) {
    var arg = args[option.option] || { count : 0};
    arg.count++;
    arg.value = option.optarg || true;

    args[option.option] = arg;

    if (options[option.option].modal) {
      modal = true;
    }
  }

  if (!modal) {
    required.forEach(function(option) {
      if (!args[option] || !args[option].value) {
        console.log("Must specify a value for option %s (%s : %s)", option, options[option].long, options[option].desc);
        info.help();
        process.exit(1);
      }
    });
  }

  // what's left in argv
  args.files = process.argv.slice(parser.optind());
  return args;
}
