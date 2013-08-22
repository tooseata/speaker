'use strict';

angular.module('speakerApp')
  .controller('ListenCtrl', function ($scope, $location, User, Room, socket, $http) {

    $scope.talker = Room.get().talker;

    $scope.closeRequest = function() {
      // close peer connection
      var talkRequests = Room.get().talkRequests;
      delete talkRequests[$scope.talker];
      Room.setTalkRequests(talkRequests);
      $location.path('/admin/');
    };

  });