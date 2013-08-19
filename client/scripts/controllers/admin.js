'use strict';

angular.module('speakerApp')
  .controller('AdminCtrl', function ($scope, User, socket) {
    $scope.user = User.get();
    $scope.talkRequests = {};
    socket.on('new:talkRequest', function (user) {
      $scope.talkRequests[user.name] = user;
    });
    socket.on('new:cancelTalkRequest', function (user) {
      delete $scope.talkRequests[user.name];
    });
  });
