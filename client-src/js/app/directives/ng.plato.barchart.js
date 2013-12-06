
define(
  [
    'charts/plato.barchart',
    'common/util'
  ],
  function(barchart, util){
    'use strict';

    var platoCharts = angular.module('plato-charts',[

    ]);

    platoCharts.directive('platoBarchart', ['$timeout', function($timeout){

      return {
        restrict : 'E',
        template : '',
        scope : {
          source : '=',
          property : '@'
        },
        link : function(scope, elem, attr) {
          elem.addClass('plato-barchart');

          var data = Object.keys(scope.source).map(function(key){
            var report = scope.source[key];
            return {
              label : key,
              value : util.dotref(report, scope.property)
            };
          });

          // Is there post-render hook for directives? todo: handle chart abstraction better
          $timeout(function(){
            barchart(data, elem[0]);
          });

        }
      };

    }]);

  }
);