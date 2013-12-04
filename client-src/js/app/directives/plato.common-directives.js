
define(
  [
    'common/util'
  ],
  function(util){
    'use strict';

    var platoCommon = angular.module('plato-common-directives',[

    ]);

    platoCommon.directive('average', ['$timeout', function($timeout){

      return {
        restrict : 'E',
        template : '<span>{{average}}</span>',
        scope : {
          source : '=',
          property : '@',
          places : '@'
        },
        link : function(scope, elem, attr) {
          elem.addClass('plato-average');

          var keys = Object.keys(scope.source);
          var sum = keys.reduce(function(prev, next){
            return prev + util.dotref(scope.source[next], scope.property);
          },0);


          scope.average = (sum / keys.length).toFixed(scope.places || 0);
        }
      };

    }]);

  }
);