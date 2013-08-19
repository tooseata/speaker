'use strict';

angular.module('speakerApp')
  .controller('AdminCtrl', function ($scope, User, socket) {
    $scope.user = User.get();
    $scope.members = 1;
    $scope.talkRequests = {};
    socket.on('new:talkRequest', function (user) {
      $scope.talkRequests[user.name] = user;
    });
    socket.on('new:cancelTalkRequest', function (user) {
      delete $scope.talkRequests[user.name];
    });
    socket.on('new:leaveRoom', function (user) {
      $scope.members--;
    });
    socket.on('new:joinRoom', function (user) {
      $scope.members++;
    });
  });
