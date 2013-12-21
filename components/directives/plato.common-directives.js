
(function(global, plato){
  'use strict';

  var platoCommon = angular.module('plato-common',[

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
          return prev + plato.util.dotref(scope.source[next], scope.property);
        },0);


        scope.average = (sum / keys.length).toFixed(scope.places || 0);
      }
    };

  }]);

}(this, plato));
