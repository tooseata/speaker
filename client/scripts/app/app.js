'use strict';

var app = angular.module('speakerApp', ['btford.socket-io', 'ui.validate', 'ngCookies']);
app.config(function ($routeProvider, $httpProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/join', {
        templateUrl: 'views/join.html',
        controller: 'JoinCtrl'
      })
      .when('/create', {
        templateUrl: 'views/create.html',
        controller: 'CreateCtrl'
      })
      .when('/talk', {
        templateUrl: 'views/talk.html',
        controller: 'TalkCtrl'
      })
      .when('/admin', {
        templateUrl: 'views/admin.html',
        controller: 'AdminCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
    $httpProvider.defaults.withCredentials = true;
  });