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
      }
      socket.emit('broadcast:setTalker', data);
      $location.path('/listen/');
    };

    // Private Variables and Page load Logic.
    var toggleQueueOnServer = function(bool){
      $http.post('/toggleQueue', JSON.stringify({room: $scope.user.room, bool: bool}));
    };

    socket.on('new:talkRequest', function (user) {
      $scope.talkRequests[user.name] = user;
      // socket.emit('broadcast:clientIsChannelReady'); // Cut out. No listner  
      socketService.isChannelReady = true;
    });

    socket.on('message', function(message) {
      console.log('Received message: ', message);
      if (message.type === 'media type') {
        User.setMediaType(message.value);
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


