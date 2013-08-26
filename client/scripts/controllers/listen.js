'use strict';

angular.module('speakerApp')

  .controller('ListenCtrl', function ($scope, $location, User, Session, Room, socketService, socket, $http, WebRtcService, $window) {
    var pcConfig = WebRtcService.pcConfig;
    var pcConstraints = WebRtcService.pcConstraints;
    var sdpConstraints = WebRtcService.sdpConstraints;
    var turnExists = WebRtcService.turnExists;

    $scope.talker = Room.get().talker;
    if ($scope.talker === ''){
      $location.path('/admin');
    }
    Session.user($scope);

    $scope.closeRequest = function() {
      WebRtcService.stop();
      WebRtcService.sendMessage('bye');
      var talkRequests = Room.get().talkRequests;
      delete talkRequests[$scope.talker];
      Room.setTalkRequests(talkRequests);
      socket.emit('broadcast:closeRequest');
      $location.path('/admin/');
    };

    socket.on('new:cancelTalkRequest', function () {
      $scope.closeRequest();
    });

    socket.on('message', function(message) {
      console.log('Received message: ', message);
      if (message.type === 'offer') {
        if (!socketService.isAdmin && !socketService.isStarted) {
          maybeStart();
        }
        socketService.pc.setRemoteDescription(new RTCSessionDescription(message));
        doAnswer();
      } else if (message.type === 'answer' && socketService.isStarted) {
        socketService.pc.setRemoteDescription(new RTCSessionDescription(message));
      } else if (message.type === 'candidate' && socketService.isStarted) {
        var candidate = new RTCIceCandidate({sdpMLineIndex:message.label,
          candidate:message.candidate});
        console.log('candidate: ', candidate);
        console.log('CANDIDATE MESSAGE', message);
        socketService.pc.addIceCandidate(candidate);
      } else if (message === 'bye' && socketService.isStarted) {
        WebRtcService.handleRemoteHangup();
      }
    });

    WebRtcService.requestTurn('https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913');

    $window.onbeforeunload = function(e) {
      WebRtcService.stop();
      WebRtcService.sendMessage('bye');
    };
    WebRtcService.maybeStart();
  });
