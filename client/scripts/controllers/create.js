'use strict';

angular.module('speakerApp')
  .controller('CreateCtrl', function ($scope, $location, $cookies, User, socket, $http) {

    // Scope Variables
    $scope.existingRooms = {};
    $scope.user = User.get();

    $scope.update = function(room) {
      if ($scope.user.room !== ''){ // if the user isn't already in a room...
        socket.emit('broadcast:leaveRoom', $scope.user);
      }
      User.setType('admin');
      User.setRoom(room);
      $scope.user = User.get();
      socket.emit('broadcast:joinRoom', $scope.user);
      $http.post('/session', JSON.stringify($scope.user));
      $location.path('/admin');
    };

    $scope.validateRoom = function(room){
      return !$scope.existingRooms[room];
    };

    // On page load.
    $http.get('/rooms').success(function(data){
      $scope.existingRooms = data;
    }).error(function(){
      console.log('error on create http req.');
    });
    if ($scope.user.type !== 'admin'){
      $http.get('/session').success(function(data){
        if (data){
          User.set(data);
          $scope.user = User.get();
        }
      });
    }
  });
