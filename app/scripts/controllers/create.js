'use strict';

angular.module('speakerApp')
  .controller('CreateCtrl', function ($scope) {
    $scope.update = function(user, room) {
      $scope.room= angular.copy(room);
    };
  });