'use strict';

angular.module('speakerApp')
  .controller('JoinCtrl', function ($scope, $location, $http, User, socket, $modal, Session) {

    // Scope variables.
    $scope.user = User.get();

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
    $scope.validateRoom = function(room){
      return $scope.existingRooms[room];
    };
    $scope.join = function(room){
      if ($scope.validateRoom(room)){
        var modal = $modal({
          template: './../views/partials/joinModal.html',
          show: true,
          backdrop: 'static',
          scope: $scope
        });
        User.setRoom(room);
      } else {
        $scope.badInput = true;
      }
    };
  });
