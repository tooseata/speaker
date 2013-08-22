'use strict';

angular.module('speakerApp')
  .controller('ListenCtrl', function ($scope, $location, User, Talker, socket, $http) {

    $scope.talker = Talker.get();

    $scope.closeRequest = function() {
      // close peer connection
      $location.path('/admin/');
    };

  });