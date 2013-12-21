
var path = require('path');

exports.registerComponents = function(plato){

  return [
    new plato.Component('plato-charts', __dirname, [
      'charts/plato.barchart.js'
    ]),
    new plato.Component('plato-common', __dirname, [
      'directives/util.js',
      'directives/ng.plato.barchart.js',
      'directives/plato.common-directives.js'
    ])
  ];
};