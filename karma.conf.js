// Karma configuration
'use strict';

module.exports = function (config) {
  config.set({
  // base path, used to resolve files and exclude
    basePath: '',

    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      'client/bower_components/angular/angular.js',
      'client/bower_components/angular-mocks/angular-mocks.js',
      'client/scripts/**/*.js',
      'test/spec/**/*.js'
    ],

    // list of files to exclude
    exclude: [],

    // test results reporter to use
    // possible values: dots || progress || growl
    reporters: ['progress', 'junit'],

    junitReporter: {
      outputFile: 'test-results.xml',
      suite: 'unit'
    },

    // web server port
    port: 8079,

    // cli runner port
    runnerPort: 9100,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    // browsers: ['Chrome'],
    browsers: ['PhantomJS'],

    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 5000,

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    plugins: [
      'karma-jasmine',
      'karma-chrome-launcher',
      'karma-junit-reporter',
      'karma-phantomjs-launcher',
      'karma-firefox-launcher'
    ]
  });
};
