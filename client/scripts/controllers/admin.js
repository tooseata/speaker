'use strict';

angular.module('speakerApp')
  .controller('AdminCtrl', function ($scope, User, socket) {
    $scope.user = User.get();
    $scope.talkRequests = [];
    socket.on('new:talkRequest', function (user) {
      $scope.talkRequests.push(user);
    });
  });
