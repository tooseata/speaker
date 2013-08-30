'use strict';

angular.module('speakerApp')

  .controller('ListenCtrl', function ($scope, $location, User, Session, Room, socketService, socket, $http, WebRtcService, $window) {
    // var pcConfig = WebRtcService.pcConfig;
    // var pcConstraints = WebRtcService.pcConstraints;
    // var sdpConstraints = WebRtcService.sdpConstraints;
    // var turnExists = WebRtcService.turnExists;

    var apiKey = "39238222";
    $scope.user = User.get();
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
      // WebRtcService.stop();
      // WebRtcService.sendMessage('bye');
      var talkRequests = Room.get().talkRequests;
      delete talkRequests[$scope.talker];
      Room.setTalkRequests(talkRequests);
      $location.path('/admin/');
    };

    socket.on('new:cancelTalkRequest', function () {
      $scope.closeRequest();
    });

    // socket.on('message', function(message) {
    //   console.log('Received message: ', message);
    //   if (message.type === 'offer') {
    //     if (!socketService.isAdmin && !socketService.isStarted) {
    //       WebRtcService.maybeStart();
    //     }
    //     socketService.pc.setRemoteDescription(new RTCSessionDescription(message));
    //     doAnswer();
    //   } else if (message.type === 'answer' && socketService.isStarted) {
    //     socketService.pc.setRemoteDescription(new RTCSessionDescription(message));
    //   } else if (message.type === 'candidate' && socketService.isStarted) {
    //     console.log('I am running from Admin RTCIceCandidate - candidate');
    //     var candidate = new RTCIceCandidate({sdpMLineIndex:message.label,
    //       candidate:message.candidate});
    //     console.log('Candidate on Admin: ', candidate);
    //     socketService.pc.addIceCandidate(candidate);
    //   } else if (message === 'bye' && socketService.isStarted) {
    //     WebRtcService.handleRemoteHangup();
    //   }
    // });
    // $window.onbeforeunload = function(e) {
    //   WebRtcService.stop();
    //   WebRtcService.sendMessage('bye');
    // };
    // WebRtcService.requestTurn('https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913');
    // WebRtcService.maybeStart();

    var sessionId = $scope.user.sessionId;
    var token = $scope.user.token;

    var sessionConnectedHandler = function(event) {
      // Subscribe to the stream
      session.subscribe(event.streams[0], 'remoteVideo');
    };

    // Initialize session, set up event listeners, and connect
    var session = TB.initSession(sessionId);
    session.addEventListener('sessionConnected', sessionConnectedHandler);
    session.connect(apiKey, token);

    // $window.onbeforeunload = function(e) {
    //   WebRtcService.stop();
    //   WebRtcService.sendMessage('bye');
    // };
    // WebRtcService.requestTurn('https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913');
    // WebRtcService.maybeStart();
  });
