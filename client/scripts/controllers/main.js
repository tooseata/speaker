'use strict';

angular.module('speakerApp')
  .controller('MainCtrl', function ($scope, $cookies) {
    // if (!$cookies.sessionCookie){
    //   $cookies.sessionCookie = Math.floor(Math.random() * 100000000000000).toString();
    // }

    // commented for testing, unfortunately cookies are pretty robust fuckers.
    $cookies.sessionCookie = Math.floor(Math.random() * 100000000000000).toString();
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma',
      'Another'
    ];
  });
