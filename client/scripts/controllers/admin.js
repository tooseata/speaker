'use strict';

angular.module('speakerApp')
  .controller('AdminCtrl', function ($scope, User, socket) {
    $scope.user = User.get();
    $scope.members = 0;
    $scope.talkRequests = {};
    socket.on('new:leaveRoom', function (user) {
      console.log('a user left the room');
      delete $scope.talkRequests[user.name];
      $scope.members--;
    });
    socket.on('new:joinRoom', function () {
      $scope.members++;
    });
    $scope.queueStatus = false;
    $scope.openQueue = function(){
      $scope.queueStatus = true;
      $scope.talkRequests = {};
      socket.on('new:talkRequest', function (user) {
        $scope.talkRequests[user.name] = user;
      });
      socket.on('new:cancelTalkRequest', function (user) {
        delete $scope.talkRequests[user.name];
      });
    };
    $scope.closeQueue = function(){
      $scope.queueStatus = false;
    };

  });
