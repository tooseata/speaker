'use strict';

angular.module('speakerApp')
  .controller('TalkCtrl', function ($scope, $location, User, Session, socketService, socket, $http, $window) {

    var apiKey = "39238222";
    $scope.user = User.get();
    $scope.sentRequest = false;
    $scope.joined = false;
    $scope.canTalk = false;
    $scope.sentQuestion = false;
    $scope.question = '';


    socket.on('new:clientIsChannelReady', function () {
      console.log('received client is channel ready from server');
      socketService.isChannelReady = true;
    });

    $scope.cancelTalkRequest = function () {
      socket.emit('broadcast:cancelTalkRequest', $scope.user);
      $scope.sentRequest = false;
    };

    socket.on('new:queueIsClosed', function (user) {
      $scope.sentRequest = false;
      window.alert('The admin is not accepting talk requests right now.', user);
    });

    socket.on('new:closeRequest', function () {
      $scope.sentRequest = false;
    });

    socket.on('new:closeRoom', function () {
      socket.emit('broadcast:leave', $scope.user);
      socket.removeAllListeners('new:closeRoom');
      User.kill();
      $scope.user = User.get();
      $location.path('/');
      window.alert('The admin closed the room.');
    });
    $scope.submitQuestion = function () {
      console.log($scope.question);
      socket.emit('question:new', {
        question: $scope.question,
        user: $scope.user
      });
      $scope.sentQuestion = true;
    };

    $scope.requestVideo = function () {


      $.ajax({
        url: 'http://10.0.1.29:3000/testPost',
        type: 'GET',
        success: function (data) {
          var parsed = JSON.parse(data);
          console.log(parsed);
          var sessionId = parsed.sessionId;
          var token = parsed.token;

          // Enable console logs for debugging
          TB.setLogLevel(TB.DEBUG);

          // Initialize session, set up event listeners, and connect
          var session = TB.initSession(sessionId);
          session.addEventListener('sessionConnected', sessionConnectedHandler);
          session.addEventListener('streamCreated', streamCreatedHandler);
          session.connect(apiKey, token);

          function sessionConnectedHandler(event) {
            var publisher = TB.initPublisher(apiKey, 'myPublisherDiv');
            session.publish(publisher);

            // Subscribe to streams that were in the session when we connected
            subscribeToStreams(event.streams);
          }

          function streamCreatedHandler(event) {
            // Subscribe to any new streams that are created
            subscribeToStreams(event.streams);
          }

          function subscribeToStreams(streams) {
            for (var i = 0; i < streams.length; i++) {
              // Make sure we don't subscribe to ourself
              if (streams[i].connection.connectionId == session.connection.connectionId) {
                return;
              }

              // Create the div to put the subscriber element in to
              var div = document.createElement('div');
              div.setAttribute('id', 'stream' + streams[i].streamId);
              document.body.appendChild(div);

              // Subscribe to the stream
              session.subscribe(streams[i], div.id);
            }
          }

        }
      });


      socket.emit('broadcast:talkRequest', $scope.user);
      $scope.sentRequest = true;
    };



    $window.onbeforeunload = function (e) {
      socket.emit('broadcast:cancelTalkRequest', $scope.user);
      $scope.sentRequest = false;
    };
  });