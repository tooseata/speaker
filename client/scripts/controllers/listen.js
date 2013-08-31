'use strict';

angular.module('speakerApp')

  .controller('ListenCtrl', function ($scope, $location, User, Session, Room, socketService, socket, $http, WebRtcService, $window) {
    var pcConfig = WebRtcService.pcConfig;
    var pcConstraints = WebRtcService.pcConstraints;
    var sdpConstraints = WebRtcService.sdpConstraints;
    var turnExists = WebRtcService.turnExists;
    var localVideo;

    $scope.talker = Room.get().talker;
    $scope.room = Room.get().talkRequests[$scope.talker].room;
    if ($scope.talker === ''){
      $location.path('/admin');
    }
    Session.user($scope);

    $scope.closeRequest = function() {
      socketService.remoteStream.stop();
      $('#remoteVideo').hide();
      socket.emit('broadcast:closeRequest', {"talker": $scope.talker + "", "room": $scope.room + ""});
      WebRtcService.stop();
      WebRtcService.sendMessage('bye');
      Room.removeTalkRequest($scope.talker);
      $location.path('/admin/');
    };

    socket.on('new:cancelTalkRequest', function () {
      $scope.closeRequest();
    });

    $window.onbeforeunload = function(e) {
      WebRtcService.stop();
      WebRtcService.sendMessage('bye');
    };
    // WebRtcService.requestTurn('https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913');
    WebRtcService.maybeStart();
  });
