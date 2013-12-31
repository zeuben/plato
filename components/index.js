
var path = require('path');

exports.registerComponents = function(plato){

  var charts = new plato.Component()
    .name('plato-charts')
    .basedir(__dirname)
    .source([
      'charts/plato.barchart.js'
    ]);

  var directives = new plato.Component()
    .name('plato-directives')
    .basedir(__dirname)
    .source([
      'directives/util.js',
      'directives/ng.plato-barchart.js',
      'directives/ng.plato-common.js'
    ])
    .styles([
      'styles/hbar.css'
    ]);

  return [ charts, directives ];
};
