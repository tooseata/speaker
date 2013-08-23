'use strict';

angular.module('speakerApp')
  .controller('MainCtrl', function ($scope, $cookies) {
    if (!$cookies.session){
      console.log('new cookie!');
      $cookies.session = Math.floor(Math.random() * 100000000000000).toString();
    }
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma',
      'Another'
    ];
  });
