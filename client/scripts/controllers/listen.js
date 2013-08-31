'use strict';

angular.module('speakerApp')

  .controller('ListenCtrl', function ($scope, $location, User, Session, Room, socketService, socket, $http, WebRtcService, $window) {

    $scope.user = User.get();
    var apiKey = "39238222";
    var sessionId = $scope.user.sessionId;
    var token = $scope.user.token;
    $scope.talker = Room.get().talker;
    $scope.talkerIsMobile = false;
    $scope.room = Room.get().talkRequests[$scope.talker].room;
    if ($scope.talker === ''){
      $location.path('/admin');
    }

    // TODO :: Do we need these variables here?
    // if (!$scope.talkerIsMobile) {
    //   var pcConfig = WebRtcService.pcConfig;
    //   var pcConstraints = WebRtcService.pcConstraints;
    //   var sdpConstraints = WebRtcService.sdpConstraints;
    //   var turnExists = WebRtcService.turnExists;
    // }
    Session.user($scope);

    $scope.closeRequest = function() {
      if (!$scope.talkerIsMobile) {
        socketService.remoteStream.stop();
        $('#remoteVideo').hide();
        WebRtcService.stop();
        WebRtcService.sendMessage('bye');
      }
      socket.emit('broadcast:closeRequest', {"talker": $scope.talker + "", "room": $scope.room + ""});
      Room.removeTalkRequest($scope.talker);
      $location.path('/admin/');
    };

    socket.on('new:openTokStreaming', function() {
      $scope.talkerIsMobile = true;
      var sessionConnectedHandler = function(event) {
        // Subscribe to the stream
        session.subscribe(event.streams[0], 'opentok');
      };
      // Initialize session, set up event listeners, and connect
      var session = TB.initSession(sessionId);
      session.addEventListener('sessionConnected', sessionConnectedHandler);
      session.connect(apiKey, token);
    });

    socket.on('new:cancelTalkRequest', function (username) {
      if (username === Room.get().talker) {
        $scope.closeRequest();
      } else {
        Room.removeTalkRequest(username);
        $scope.talkRequests = Room.getTalkRequests();
      }
    });

    socket.on('new:beginWebRTC', function() {
      $scope.beginWebRTC();
    });

    $scope.beginWebRTC = function() {
      socket.on('message', function(message) {
        console.log('Received message: ', message);
        if (message.type === 'offer') {
          if (!socketService.isAdmin && !socketService.isStarted) {
            WebRtcService.maybeStart();
          }
          socketService.pc.setRemoteDescription(new RTCSessionDescription(message));
          doAnswer();
        } else if (message.type === 'answer' && socketService.isStarted) {
          socketService.pc.setRemoteDescription(new RTCSessionDescription(message));
        } else if (message.type === 'candidate' && socketService.isStarted) {
          console.log('I am running from Admin RTCIceCandidate - candidate');
          var candidate = new RTCIceCandidate({sdpMLineIndex:message.label,
            candidate:message.candidate});
          console.log('Candidate on Admin: ', candidate);
          socketService.pc.addIceCandidate(candidate);
        } else if (message === 'bye' && socketService.isStarted) {
          WebRtcService.handleRemoteHangup();
        }
      });
      $window.onbeforeunload = function(e) {
        WebRtcService.stop();
        WebRtcService.sendMessage('bye');
      };
      // WebRtcService.requestTurn('https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913');
      WebRtcService.maybeStart();
    };

    socket.emit('broadcast:setTalker', {talker: Room.getTalker(), roomName: User.get().room});
  });
