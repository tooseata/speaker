'use strict';

angular.module('speakerApp')
  .controller('JoinCtrl', function ($scope, User, socket, $http) {
    $scope.existingRooms = {};
    $http.get('/rooms').success(function(data){
      console.log(data);
      $scope.existingRooms = data;
    }).error(function(){
      console.log('error on create http req.');
    });
    $scope.user = User;
    $scope.update = function(userName, room) {
      console.log($scope.user.get(), 'updated');
      socket.emit('broadcast:leaveRoom', {user : $scope.user.get()});
      $scope.user.setType('talker');
      $scope.user.setName(userName);
      $scope.user.setRoom(room);
      socket.emit('broadcast:joinRoom', {user : $scope.user.get()});
      $http.post('/session', JSON.stringify($scope.user.get()));
    };
    $scope.validateRoom = function(room){
      return $scope.existingRooms[room];
    };
    $scope.validateName = function(name){
      return !$scope.existingRooms[$scope.room][name];
    };
  });
