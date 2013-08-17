'use strict';

angular.module('speakerApp')
  .controller('JoinCtrl', function ($scope) {
    $scope.update = function(user, room) {
      $scope.user= angular.copy(user);
      $scope.room= angular.copy(room);
    };

  });
