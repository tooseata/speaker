'use strict';

angular.module('speakerApp')
  .controller('AdminCtrl', function ($scope, $location, User, Session, Room, socket, $http, socketService) {
    // Scope
    Session.userRoom($scope);
    $scope.talkRequests = Room.getTalkRequests();
    $scope.memberCount = Room.get().memberCount;
    $scope.user = User.get();
    $scope.queueStatus = true;
    $scope.localstream;
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
      Room.kill();
      $scope.user = User.get();
      $http.post('/session', JSON.stringify($scope.user));
      $location.path('/');
    };
    $scope.fillRequest = function(name){
      // socket broadcast to set talker on server
      Room.setMemberCount($scope.memberCount);
      Room.setTalker(name);
      $location.path('/listen/');
    };
    var addUser = function(talkRequests, user){
      var i = 0;
      while (talkRequests[i] && talkRequests[i].karma > user.karma){
        i++;
      }
      talkRequests.splice(i, 0, user);
    };
    // Private Variables and Page load Logic.
    var toggleQueueOnServer = function(bool){
      $http.post('/toggleQueue', JSON.stringify({room: $scope.user.room, bool: bool}));
    };

    socket.on('new:cancelTalkRequest', function (username) {
      Room.removeTalkRequest(username);
      $scope.talkRequests = Room.getTalkRequests();
    });

    socket.on('new:talkRequest', function (user) {
      Room.addTalkRequest(user);
      addUser($scope.talkRequests, user);
      // socket.emit('broadcast:clientIsChannelReady'); // Cut out. No listner
      socketService.isChannelReady = true;
    });

    socket.on('message', function(message) {
      if (message.type === 'offer') {
        if (!socketService.isAdmin && !socketService.isStarted) {
          WebRtcService.maybeStart();
        }
        socketService.pc.setRemoteDescription(new RTCSessionDescription(message));
        doAnswer();
      } else if (message.type === 'media type') {
        User.setMediaType(message.value);
      } else if (message.type === 'answer' && socketService.isStarted) {
        socketService.pc.setRemoteDescription(new RTCSessionDescription(message));
      } else if (message.type === 'candidate' && socketService.isStarted) {
        var candidate = new RTCIceCandidate({sdpMLineIndex:message.label,
          candidate:message.candidate});
        socketService.pc.addIceCandidate(candidate);
      } else if (message === 'bye' && socketService.isStarted) {
        WebRtcService.handleRemoteHangup();
      }
    });

    socket.on('new:leaveRoom', function (user) {
      Room.removeTalkRequest(user.name);
      $scope.talkRequests = Room.getTalkRequests();
      if ($scope.memberCount > 0) {
        $scope.memberCount--;
      }
    });

    socket.on('new:joinRoom', function () {
      $scope.memberCount++;
    });

    socket.on('new:microphoneClickedOnClientSide', function(data) {
      socketService.ready = true;
    });
  });


