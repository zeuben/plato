
define(
  [
    '../config'
  ],
  function(config){

    var loginApp = angular.module('platoApp', [
    ]);

    loginApp.controller('appCtrl', [
      '$scope',
      function($scope) {
        $scope.config = config;
      }
    ]);

});