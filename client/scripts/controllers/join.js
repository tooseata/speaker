'use strict';

angular.module('speakerApp')
  .controller('JoinCtrl', function ($scope, User, socket) {
    $scope.user = User;
    $scope.update = function(userName, room) {
      console.log($scope.user.get(), 'updated');
      socket.emit('broadcast:leaveRoom', {user : $scope.user.get()});
      $scope.user.setType('talker');
      $scope.user.setName(userName);
      $scope.user.setRoom(room);
      socket.emit('broadcast:joinRoom', {user : $scope.user.get()});
    };
  });
