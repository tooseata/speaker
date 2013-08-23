'use strict';

angular.module('speakerApp')
  .controller('JoinCtrl', function ($scope, $location, User, socket, $http) {

    // Scope variables.
    $scope.existingRooms = {};
    $scope.user = User.get();

    $scope.update = function(userName, room) {
      if ($scope.user.room){
        socket.emit('broadcast:leaveRoom', $scope.user);
      }
      User.setType('user');
      User.setName(userName);
      User.setRoom(room);
      $scope.user = User.get();
      socket.emit('broadcast:joinRoom', $scope.user);
      $http.post('/session', JSON.stringify($scope.user));
      $location.path('/talk');
    };

    $scope.validateRoom = function(room){
      return $scope.existingRooms[room];
    };

    $scope.validateName = function(name){
      return !$scope.existingRooms[$scope.room].members[name];
    };

    // On page load.
    $http.get('/rooms').success(function(data){
      $scope.existingRooms = data;
    }).error(function(){
      console.log('error on room collection.');
    });
    if ($scope.user.name === ''){
      $http.get('/session').success(function(data){
        if (data){
          User.set(data);
          $scope.user = User.get();
        }
      });
    }
  });
