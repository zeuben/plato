
requirejs.config({
});

requirejs(
  [
    'app'
  ],
  function (app) {
    angular.bootstrap(document, ['platoApp']);
  }
);