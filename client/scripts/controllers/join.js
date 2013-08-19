'use strict';

angular.module('speakerApp')
  .controller('JoinCtrl', function ($scope, User, socket) {
    $scope.user = User;
    $scope.update = function(userName, room) {
      console.log('updated');
      $scope.user.setType('talker');
      $scope.user.setName(userName);
      $scope.user.setRoom(room);
      socket.emit('broadcast:leaveRoom', {user : $scope.user.get()});
      socket.emit('broadcast:joinRoom', {user : $scope.user.get()});
    };
  });
