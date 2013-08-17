'use strict';

angular.module('speakerApp')
  .controller('CreateCtrl', function ($scope, User) {
    $scope.user = User.get();
    $scope.update = function(room) {
      $scope.user.setRoom(room);
      $scope.user.setType('admin');
    };
  });
