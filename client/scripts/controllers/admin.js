'use strict';

angular.module('speakerApp')
  .controller('AdminCtrl', function ($scope, $location, User, socket, $http) {
    // Scope
    $scope.talkRequests = {};
    $scope.memberCount = 1;
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
      User.set({});
      $scope.user = User.get();
      $http.post('/session', JSON.stringify($scope.user));
      $location.path('/');
    };
    // Private Variables and Page load Logic.
    var members = {};

    if (User.get().type !== 'admin'){
      $http.get('/session').success(function(data){
        if(data){
          User.set(data);
          $scope.user = User.get();
          socket.emit('broadcast:join', $scope.user);
          $http.get('/room/' + $scope.user.room + '').success(function(room){
            members = room.members;
            $scope.talkRequests = room.talkRequests;
            $scope.memberCount = countMembers();
          });
        }
      });
    }

    var toggleQueueOnServer = function(bool){
      $http.post('/toggleQueue', JSON.stringify({room: $scope.user.room, bool: bool}));
    };

    var countMembers = function(){
      var count = 0;
      for (var i in members){
        count++;
      }
      return count;
    };

    //              Listeners

    socket.on('new:talkRequest', function (user) {
      $scope.talkRequests[user.name] = user;
    });

    socket.on('new:cancelTalkRequest', function (user) {
      delete $scope.talkRequests[user.name];
    });

    socket.on('new:leaveRoom', function (user) {
      delete $scope.talkRequests[user.name];
      delete members[user.name];
      $scope.memberCount--;
    });

    socket.on('new:joinRoom', function (user) {
      members[user.name] = user;
      $scope.memberCount++;
    });

  });


