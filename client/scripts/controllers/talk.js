'use strict';

angular.module('speakerApp')
  .controller('TalkCtrl', function ($scope, User, socket) {
    $scope.user = User;
    $scope.sendTalkRequest = function(){
      socket.emit('broadcast:talkRequest', {user : $scope.user.get()});
    };
  });
