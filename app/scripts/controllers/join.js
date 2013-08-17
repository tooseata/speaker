'use strict';

angular.module('speakerApp')
  .controller('JoinCtrl', function ($scope) {
    $scope.user = {};

    $scope.update = function(user) {
      $scope.user= angular.copy(user);
    };

  });
