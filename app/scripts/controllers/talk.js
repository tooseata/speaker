'use strict';

angular.module('speakerApp')
  .controller('TalkCtrl', function ($scope, User) {
    console.log(User);
    $scope.sendTalkRequest = function(){
      $scope.user = User;
      console.log('woo');
    };
  });
