'use strict';

angular.module('speakerApp')
  .controller('AdminCtrl', function ($scope, $location, User, Room, socket, $http, socketService) {
    // Scope
    $scope.talkRequests = Room.get().talkRequests;
    $scope.memberCount = Room.get().memberCount;
    $scope.user = User.get();
    $scope.queueStatus = true;

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
      Room.setTalkRequests($scope.talkRequests);
      Room.setMemberCount($scope.memberCount);
      Room.setTalker(name);
      $location.path('/listen/');
    };

    // Private Variables and Page load Logic.
    if (User.get().type === 'admin') {
      socketService.isAdmin = true;
    } else {
      $http.get('/session').success(function(data){
        if(data){
          User.set(data);
          $scope.user = User.get();
          socket.emit('broadcast:join', $scope.user);
          $http.get('/room/' + $scope.user.room + '').success(function(room){
            $scope.talkRequests = room.talkRequests;
            $scope.memberCount = countMembers(room.members);
            socketService.isAdmin = true;
          });
        }
      });
    }

    var toggleQueueOnServer = function(bool){
      $http.post('/toggleQueue', JSON.stringify({room: $scope.user.room, bool: bool}));
    };

    var countMembers = function(members){
      var count = 0;
      _.each(members, function(){
        count++;
      });
      return count;
    };

    //              Listeners

    socket.on('new:talkRequest', function (user) {
      $scope.talkRequests[user.name] = user;
      socket.emit('broadcast:clientIsChannelReady');
      socketService.isChannelReady = true;
    });

    socket.on('new:cancelTalkRequest', function (user) {
      delete $scope.talkRequests[user.name];
    });

    socket.on('new:leaveRoom', function (user) {
      delete $scope.talkRequests[user.name];
      $scope.memberCount--;
    });

    socket.on('new:joinRoom', function () {
      $scope.memberCount++;
    });


    socket.on('new:microphoneClickedOnClientSide', function() {
      socketService.ready = true;
    });
  });


