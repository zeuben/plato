
(function(global, plato){
  'use strict';

  var platoCommon = angular.module('plato-directives',[]);

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

  platoCommon.directive('list', ['$compile', '$rootScope', function($compile, $rootScope){

    function postLink($scope, $elem, $attr, controller, transclude) {
      $scope.max = plato.util.findMax.bind(null, $scope.items);

      var list = $elem.find('.plato-item-list');
      Object.keys($scope.items).forEach(function(key){
        var scope = $scope.$new();
        scope.item = $scope.items[key];
        transclude(scope, function(clone) {
          list.append(angular.element('<li></li>').append(clone));
        });
      });
    }

    return {
      restrict : 'E',
      template : '<ol class="plato-item-list"></ol>',
      transclude : true,
      scope : {
        items : '='
      },
      link : postLink
    };
  }]);

  platoCommon.directive('hbar', [function(){

    return {
      restrict : 'E',
      template :  '<div class="plato-hbar-container">' +
                    '<h3 class="plato-hbar-label"></h3>' +
                    '<div class="plato-hbar-outer">' +
                      '<div class="plato-hbar-inner"></div>' +
                    '</div>' +
                  '</div>',
      link : function(scope, elem, attr) {
        elem.find('.plato-hbar-outer').css({
          width: '100%',
          height: (attr.height || 20) + 'px'
        });
        elem.find('.plato-hbar-label').html(attr.label);

        var value = plato.util.dotref(scope, attr.property);

        var max = !isNaN(+attr.max) ?
                    +attr.max :
                    scope.max ?
                      scope.max(attr.max) :
                      plato.util.dotref(scope, attr.max);

        var min = !isNaN(+attr.min) ?
                    +attr.min :
                    scope.min ?
                      scope.min(attr.min) :
                      plato.util.dotref(scope, attr.min);

        if (value < min) value = min;
        if (value > max) value = max;

        var plottedValue = (value - min) / (max - min);
        elem.find('.plato-hbar-inner').css({
          height : '100%',
          width : (plottedValue.toFixed(2) * 100) + '%',
          backgroundColor : attr.color || 'red'
        });
      }
    };

  }]);



}(this, plato));
