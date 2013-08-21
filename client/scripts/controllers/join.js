'use strict';

angular.module('speakerApp')
  .controller('JoinCtrl', function ($scope, $location, User, socket, $http) {
    $scope.existingRooms = {};
    $http.get('/rooms').success(function(data){
      console.log(data);
      $scope.existingRooms = data;
    }).error(function(){
      console.log('error on room collection.');
    });
    $scope.user = User;
    $scope.update = function(userName, room) {
      console.log($scope.user.get(), 'updated');
      if ($scope.user.get().room !== ''){
        socket.emit('broadcast:leaveRoom', {user : $scope.user.get()});
      }
      $scope.user.setType('talker');
      $scope.user.setName(userName);
      $scope.user.setRoom(room);
      socket.emit('broadcast:joinRoom', {user : $scope.user.get()});
      $location.path('/talk/');
      $http.post('/session', JSON.stringify($scope.user.get()));
    };
    $scope.validateRoom = function(room){
      return $scope.existingRooms[room];
    };
    $scope.validateName = function(name){
      return !$scope.existingRooms[$scope.room].members[name];
    };
  });
