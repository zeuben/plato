
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
      link : function(scope, el, attr) {
        el.addClass('plato-average');

        var keys = Object.keys(scope.source);
        var sum = keys.reduce(function(prev, next){
          return prev + plato.util.dotref(scope.source[next], scope.property);
        },0);


        scope.average = (sum / keys.length).toFixed(scope.places || 0);
      }
    };

  }]);

  platoCommon.directive('platoElement', ['$compile', function($compile){
    return {
      restrict : 'A',
      scope : {
        element : '=',
        config : '=',
        report : '='
      },
      link : function(scope, el, attr){
        el.append($compile(scope.element)(scope));
      }
    };
  }]);

  platoCommon.directive('num', [function(){
    return {
      restrict : 'E',
      template : '<span ng-class="[\'plato-num\', \'plato-num-\' + getClass(numberband, value)]">{{value}}</span>',
      scope : {
        source : '=',
        property : '@',
        numberband : '@'
      },
      link : function(scope, el, attr) {
        scope.value = plato.util.dotref(scope.source, scope.property);
        scope.getClass = plato.util.getStringFromBand;
      }
    }

  }]);

  platoCommon.directive('list', ['$compile', '$rootScope', function($compile, $rootScope){

    function postLink(scope, el, attr, controller, transclude) {
      scope.max = plato.util.findMax.bind(null, scope.items);

      var list = el.find('.plato-item-list');
      Object.keys(scope.items).forEach(function(key){
        var childScope = scope.$new();
        childScope.item = scope.items[key];
        transclude(childScope, function(clone) {
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
      link : function(scope, el, attr) {
        el.find('.plato-hbar-outer').css({
          width: '100%',
          height: (attr.height || 20) + 'px'
        });
        el.find('.plato-hbar-label').html(attr.label);

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
        el.find('.plato-hbar-inner').css({
          height : '100%',
          width : (plottedValue.toFixed(2) * 100) + '%',
          backgroundColor : attr.color || 'red'
        });
      }
    };

  }]);



}(this, plato));
