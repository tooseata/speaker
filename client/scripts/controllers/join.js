'use strict';

angular.module('speakerApp')
  .controller('JoinCtrl', function ($scope, User) {
    $scope.user = User;
    $scope.update = function(userName, room) {
      console.log('updated');
      $scope.user.setType('talker');
      $scope.user.setName(userName);
      $scope.user.setRoom(room);
    };
  });