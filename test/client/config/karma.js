// Karma configuration
// Generated on %DATE%

module.exports = function(config) {
  config.set({
    basePath: '../../../',
    frameworks: ['jasmine'],
    files: [
      'client-src/js/vendor/jquery/jquery.js',
      'client-src/js/vendor/angular/angular.js',
      'client-src/js/vendor/angular-mocks/angular-mocks.js',
      'components/directives/util.js',
      'components/directives/ng.plato-common.js',
      'test/client/unit/**/*.js'
    ],
    exclude: [],
    reporters: ['progress'], // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO, // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    autoWatch: true,
    browsers: ['Chrome'], // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    singleRun: false // if true, Karma captures browsers, runs the tests and exits
  });
};
