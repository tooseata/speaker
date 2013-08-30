'use strict';

angular.module('speakerApp')
  .controller('AdminCtrl', function ($scope, $location, User, Session, Room, socket, $http, socketService) {
    // Scope
    Session.userRoom($scope);
    $scope.talkRequests = Room.get().talkRequests;
    $scope.memberCount = Room.get().memberCount;
    $scope.user = User.get();
    $scope.queueStatus = true;
    socketService.isAdmin = true;


    $scope.openQueue = function(){
      $scope.queueStatus = true;
      toggleQueueOnServer(true);
    };
    $scope.closeQueue = function(){
      $scope.queueStatus = false;
      toggleQueueOnServer(false);
    };
    $scope.closeRoom = function(){
      socket.emit('broadcast:closeRoom', $scope.user);
      User.kill();
      $scope.user = User.get();
      $http.post('/session', JSON.stringify($scope.user));
      $location.path('/');
    };
    $scope.fillRequest = function(name){
      // socket broadcast to set talker on server
      Room.setTalkRequests($scope.talkRequests);
      Room.setMemberCount($scope.memberCount);
      Room.setTalker(name);
      var data = {
        talker: Room.getTalker(),
        roomName: $scope.user.room
      };
      socket.emit('broadcast:setTalker', data);
      $location.path('/listen/');
    };

    // Private Variables and Page load Logic.
    var toggleQueueOnServer = function(bool){
      $http.post('/toggleQueue', JSON.stringify({room: $scope.user.room, bool: bool}));
    };

    socket.on('new:adminOpentokInfo', function(data) {
      User.setSessionId(data.sessionId);
      User.setToken(data.token);
      $scope.user = User.get();
    });

    socket.on('new:talkRequest', function (user) {
      $scope.talkRequests[user.name] = user;
      // socket.emit('broadcast:clientIsChannelReady'); // Cut out. No listner  
      socketService.isChannelReady = true;
    });

    socket.on('message', function(message) {
      console.log('Received message: ', message);
      if (message.type === 'offer') {
        if (!socketService.isAdmin && !socketService.isStarted) {
          WebRtcService.maybeStart();
        }
        socketService.pc.setRemoteDescription(new RTCSessionDescription(message));
        doAnswer();
      } else if (message.type === 'media type') {
        console.log('SETTING MEDIA TYPE ON ADMIN SIDE TO', message.value);
        User.setMediaType(message.value);
        console.log('DOUBLE CHECKING TO MAKE SURE MEDIA TYPE IS', User.get().mediaType);
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

    socket.on('new:leaveRoom', function (user) {
      delete $scope.talkRequests[user.name];
      if ($scope.memberCount > 0) {
        $scope.memberCount--;
      }
    });

    socket.on('new:joinRoom', function () {
      $scope.memberCount++;
    });

    socket.on('new:microphoneClickedOnClientSide', function(data) {
      console.log("************new:microphoneClickedOnClientSide", data);
      socketService.ready = true;
    });
  });


