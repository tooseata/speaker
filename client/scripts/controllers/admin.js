'use strict';
angular.module('speakerApp')
  .controller('AdminCtrl', function ($scope, User, socketService, socket, $http, WebRtcService) {
    $scope.members = {};
    $scope.talkRequests = {};
    $scope.memberCount = 0;
    $scope.user = User.get();
    if (User.get().type === 'admin') {
      socketService.isAdmin = true;
    } else {
      $http.get('/session').success(function(data){ // async
        User.set(data);
        $scope.user = User.get();
        socket.emit('broadcast:joinRoom', {user: $scope.user});
        $http.get('/room/' + $scope.user.room + '').success(function(room){
          console.log(room, 'room');
          $scope.members = room.members;
          $scope.talkRequests = room.talkRequests;
          $scope.memberCount = $scope.countMembers();
        });
      });
    }

    $scope.queueStatus = false;
    $scope.openQueue = function(){
      $scope.queueStatus = true;
    };
    $scope.closeQueue = function(){
      $scope.queueStatus = false;
    };

    socket.on('new:talkRequest', function (user) {
      $scope.talkRequests[user.name] = user;
      socket.emit('clientIsChannelReady');
      socketService.isChannelReady = true;
    });

    socket.on('new:cancelTalkRequest', function (user) {
      delete $scope.talkRequests[user.name];
    });
    socket.on('new:leaveRoom', function (user) {
      delete $scope.talkRequests[user.name];
      delete $scope.members[user.name];
      $scope.memberCount--;
    });
    socket.on('new:joinRoom', function (user) {
      console.log('room was joined by ' + user.name);
      $scope.members[user.name] = user;
      $scope.memberCount++;
    });

    $scope.countMembers = function(){
      var count = -1;
      for (var i in $scope.members){
        count++;
      }
      return count;
    };

    socket.on('new:checkQueueStatus', function (user) {
      if ($scope.queueStatus) {
        socket.emit('broadcast:queueIsOpen', user);
      } else {
        socket.emit('broadcast:queueIsClosed', user);
      }
    });

    socket.on('new:microphoneClickedOnClientSide', function() {
      socketService.ready = true;
    });

    $scope.fillRequest = function(name){

      var pcConfig = WebRtcService.pcConfig;
      var pcConstraints = WebRtcService.pcConstraints;
      var sdpConstraints = WebRtcService.sdpConstraints;
      var remoteAudio = WebRtcService.remoteAudio;
      var turnExists = WebRtcService.turnExists;

      var room = name;

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

      window.onbeforeunload = function(e) {
        sendMessage('bye');
      };

      WebRtcService.maybeStart();

    };
  });

