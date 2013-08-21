'use strict';

angular.module('speakerApp')
  .controller('CreateCtrl', function ($scope, $location, User, socket, $http) {
    $scope.existingRooms = {};
    $http.get('/rooms').success(function(data){
      $scope.existingRooms = data;
    }).error(function(){
      console.log('error on create http req.');
    });
    $scope.user = User;
    $scope.mediaType = {audio: true};
    $scope.audio = function() {
      $scope.mediaType = {audio: true};
    };
    $scope.audioVideo = function() {
      $scope.mediaType = {audio: true, video: true};
    };
    $scope.update = function(room) {
      $scope.user.setType('admin');
      socket.emit('broadcast:leaveRoom', {user : $scope.user.get()});
      $scope.user.setRoom(room);
      socket.emit('broadcast:joinRoom', {user : $scope.user.get()});
      $location.path('/admin/');
      $http.post('/session', JSON.stringify($scope.user.get()));
    };
    $scope.validateRoom = function(room){
      return !$scope.existingRooms[room];
    };
  });
