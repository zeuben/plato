
define(
  [
    'config',
    'reports/aggregate'
  ],
  function(config, reportsAggregate){


    return function bootstrap() {
      var loginApp = angular.module('platoApp', [
        'ngRoute'
      ].concat(config.components));

      loginApp.controller('appCtrl', [
        '$scope',
        function($scope) {
          $scope.config = config;
          $scope.report = reportsAggregate;

          $scope.classForLength = function(length) {
            var columns = 12 / length;
            return 'large-' + columns + ' columns';
          };

        }
      ]);

      angular.bootstrap(document, ['platoApp']);
    }

});
