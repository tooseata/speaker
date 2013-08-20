'use strict';

angular.module('speakerApp')
  .controller('CreateCtrl', function ($scope, User, socket, $http) {
    $scope.existingRooms = {};
    $http.get('/rooms').success(function(data){
      console.log(data);
      $scope.existingRooms = data;
    }).error(function(){
      console.log('error on create http req.');
    });
    $scope.user = User;
    $scope.update = function(room) {
      socket.emit('broadcast:leaveRoom', {user : $scope.user.get()});
      $scope.user.setRoom(room);
      $scope.user.setType('admin');
      socket.emit('broadcast:joinRoom', {user : $scope.user.get()});
    };
    $scope.validateRoom = function(room){
      return !$scope.existingRooms[room];
    };
  });
