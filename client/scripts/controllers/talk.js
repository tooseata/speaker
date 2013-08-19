'use strict';

angular.module('speakerApp')
  .controller('TalkCtrl', function ($scope, User, socket) {
    $scope.user = User;
    $scope.sentRequest = false;
    $scope.sendTalkRequest = function(){
      socket.emit('broadcast:talkRequest', {user : $scope.user.get()});
      $scope.sentRequest = true;
    };
    $scope.cancelTalkRequest = function(){
      socket.emit('broadcast:cancelTalkRequest', {user : $scope.user.get()});
      $scope.sentRequest = false;
    };
  });
