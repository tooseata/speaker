'use strict';

var app = angular.module('speakerApp', ['ui.validate', 'ngCookies']);

app.config(function ($routeProvider, $httpProvider, $compileProvider) {
   $routeProvider
       .when('/', {
             templateUrl: 'views/main.html',
             controller: 'MainCtrl'
             })
       .when('/join', {
             templateUrl: 'views/join.html',
             controller: 'JoinCtrl'
             })
       .when('/talk', {
             templateUrl: 'views/talk.html',
             controller: 'TalkCtrl'
             })
       .when('/questions', {
             templateUrl: 'views/questions.html',
             controller: 'QuestionsCtrl'
             })
       .otherwise({
                  redirectTo: '/'
                  });
   $compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
   $httpProvider.defaults.withCredentials = true;
   $httpProvider.defaults.useXDomain = true;
   delete $httpProvider.defaults.headers.common['X-Requested-With'];
});
