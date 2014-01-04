
define(
  [
    'config'
  ],
  function(config){

    return function bootstrap(report) {
      var loginApp = angular.module('platoApp', [
        'ngRoute'
      ].concat(config.components));

      loginApp.controller('appCtrl', [
        '$routeParams',
        '$scope',
        function($routeParams, $scope) {
          $scope.config = config;

          $scope.report = report;
          console.log(report);

          $scope.classForLength = function(length) {
            var columns = 12 / length;
            return 'large-' + columns + ' columns';
          };

        }
      ]);

      angular.bootstrap(document, ['platoApp']);
    }

});
