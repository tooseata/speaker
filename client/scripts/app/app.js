'use strict';

var app = angular.module('speakerApp', ['ui.validate', 'ngCookies', '$strap.directives']);

  app.config(function ($routeProvider, $httpProvider) {
    $routeProvider
      .when('/', {templateUrl: 'views/main.html', controller: 'MainCtrl'})
      .when('/talk', {templateUrl: 'views/talk.html', controller: 'TalkCtrl'})
      .when('/admin', {templateUrl: 'views/admin.html', controller: 'AdminCtrl'})
      .when('/listen', {templateUrl: 'views/listen.html', controller: 'ListenCtrl'})
      .when('/questions', {templateUrl: 'views/questions.html', controller: 'QuestionsCtrl'})
      .when('/about', {templateUrl: 'views/about.html',controller: 'AboutPage'})
      .otherwise({redirectTo: '/'});
    $httpProvider.defaults.withCredentials = true;
  });
