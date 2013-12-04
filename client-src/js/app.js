
define(
  [
    '../config',
    '../reports/aggregate',
    'app/directives/ng.plato.barchart',
    'app/directives/plato.common-directives'
  ],
  function(config, reportsAggregate){

    var loginApp = angular.module('platoApp', [
      'plato-charts',
      'plato-common-directives'
    ]);

    loginApp.controller('appCtrl', [
      '$scope',
      '$sce',
      '$compile',
      function($scope, $sce, $compile) {
        $scope.config = config;
        $scope.reports = reportsAggregate;

        $scope.classForLength = function(length) {
          var columns = 12 / length;
          return 'large-' + columns + ' columns';
        };

      }
    ]);

    loginApp.directive('platoElement', ['$compile', function($compile){

      return {
        restrict : 'A',
        scope : {
          element : '=',
          config : '=',
          reports : '='
        },
//        transclude : true,
        link : function(scope, element, attrs){
          element.append($compile(scope.element)(scope));
        }
      };
    }]);



});