'use strict';

angular.module('speakerApp', [])
  .config(function ($routeProvider) {
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
      .otherwise({
        redirectTo: '/'
      });
  });
