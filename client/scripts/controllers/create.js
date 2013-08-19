'use strict';

angular.module('speakerApp')
  .controller('CreateCtrl', function ($scope, User, socket) {
    $scope.user = User;
    $scope.update = function(room) {
      socket.emit('broadcast:leaveRoom', {user : $scope.user.get()});
      $scope.user.setRoom(room);
      $scope.user.setType('admin');
      socket.emit('broadcast:joinRoom', {user : $scope.user.get()});
    };
  });
