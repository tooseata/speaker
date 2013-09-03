'use strict';

angular.module('speakerApp')
  .controller('CreateCtrl', function ($scope, $location, $http, Session, User, socket, $modal) {

    // Scope Variables
    $scope.existingRooms = Session.existingRooms($scope);
    $scope.user = User.get();

    $scope.update = function(room) {
      $scope.dismiss();
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

    $scope.create = function(){
      var modal = $modal({
        template: './../views/partials/createModal.html',
        show: true,
        backdrop: 'static',
        scope: $scope
      });
    };

    $scope.validateRoom = function(room){
      return !$scope.existingRooms[room];
    };
  });