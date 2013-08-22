'use strict';

angular.module('speakerApp')
  .controller('TalkCtrl', function ($scope, $location, User, socket, $http) {
    $scope.user = User.get();
    $scope.sentRequest = false;

    $scope.sendTalkRequest = function(){
      socket.emit('broadcast:talkRequest', $scope.user);
      $scope.sentRequest = true;
    };

    $scope.cancelTalkRequest = function(){
      socket.emit('broadcast:cancelTalkRequest', $scope.user);
      $scope.sentRequest = false;
    };

    socket.on('new:queueIsClosed', function() {
      window.alert('The admin is not accepting talk requests right now.');
    });

    socket.on('new:closeRoom', function() {
      socket.emit('broadcast:leave', $scope.user);
      socket.removeAllListeners('new:closeRoom');
      User.kill();
      $scope.user = User.get();
      $location.path('/');
      window.alert('The admin closed the room.');
    });

    if ($scope.user.name === ''){
      $http.get('/session').success(function(data){
        if (data){
          console.log(data);
          User.set(data);
          $scope.user = User.get();
        }
      });
    }
  });