'use strict';

angular.module('speakerApp')
  .controller('JoinCtrl', function ($scope, $location, $http, User, socket, Session) {

    // Scope variables.
    $scope.user = User.get();
    var path = $location.path().replace('/join', '').slice(1);
    $http.get('/rooms').success(function(data){
      $scope.existingRooms = data;
      if (path && !data[path]){
        $location.path('/join');
      } else {
        $scope.room = path;
        User.setRoom(path);
      }
    }).error(function(){
      console.log('error on room collection.');
    });

    $scope.update = function(userName) {
      User.setType('user');
      User.setName(userName);
      $scope.user = User.get();
      socket.emit('broadcast:joinRoom', $scope.user);
      $http.post('/session', JSON.stringify($scope.user));
      $location.path('/talk');
    };

    $scope.validateName = function(name){
      return !$scope.existingRooms[$scope.room].members[name];
    };
  });
