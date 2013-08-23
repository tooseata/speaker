'use strict';

angular.module('speakerApp')

  .controller('TalkCtrl', function ($scope, $location, User, socketService, socket, WebRtcService, $http) {
    
    $scope.user = User.get();
    $scope.sentRequest = false;
    $scope.joined = false;

    socket.on('new:clientIsChannelReady', function(){
      console.log('received client is channel ready from server');
      socketService.isChannelReady = true;
      $scope.requestAudio();
    });

    $scope.sendTalkRequest = function(){
      console.log('talk request called from client side');
      socket.emit('broadcast:talkRequest', $scope.user);
      $scope.sentRequest = true;
    };

    $scope.cancelTalkRequest = function(){
      socket.emit('broadcast:cancelTalkRequest', $scope.user);
      $scope.sentRequest = false;
    };
    socket.on('new:queueIsClosed', function(user) {
      $scope.sentRequest = false;
      window.alert('The admin is not accepting talk requests right now.', user);
    });

    if ($scope.user.name === ''){
      $http.get('/session').success(function(data){
        if (data){
          console.log(data);
          User.set(data);
          $scope.user = User.get();
        }
      });
    }

    socket.on('new:closeRoom', function() {
      socket.emit('broadcast:leave', $scope.user);
      socket.removeAllListeners('new:closeRoom');
      User.kill();
      $scope.user = User.get();
      $location.path('/');
      window.alert('The admin closed the room.');
    });

    $scope.requestAudio = function(){
      var sample = new MicrophoneSample();
      var context = new webkitAudioContext();
      var analyser = context.createAnalyser();
      // shim layer with setTimeout fallback
      var requestAnimFrame = (function(){
        return  window.requestAnimationFrame       ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame    ||
                window.oRequestAnimationFrame      ||
                window.msRequestAnimationFrame     ||
          function( callback ){
          window.setTimeout(callback, 1000 / 60);
          };
      })();
      function MicrophoneSample() {
        this._width = 640;
        this._height = 480;
        this.canvas = document.querySelector('canvas');
      }
      // getUserMedia(constraints, handleUserMedia, )
      var getMicrophoneInput = function (source) {
        getUserMedia({audio: true}, onStream, onStreamError);
      };
      var onStream = function(stream) {
        socket.emit('broadcast:microphoneClickedOnClientSide');
        var input = context.createMediaStreamSource(stream);
        var filter = context.createBiquadFilter();
        filter.frequency.value = 60.0;
        filter.type = filter.NOTCH;
        filter.Q = 10.0;
        // Connect graph.
        input.connect(filter);
        filter.connect(analyser);
        requestAnimFrame(visualize.bind(analyser));
        handleUserMedia(stream);
      };

      var onStreamError = function(e) {
        console.error('Error getting microphone', e);
      };

      var visualize = function() {
        sample.canvas.width = sample._width;
        sample.canvas.height = sample._height;
        var drawContext = sample.canvas.getContext('2d');

        var times = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteTimeDomainData(times);
        for (var i = 0; i < times.length; i++) {
          var value = times[i];
          var percent = value / 256;
          var height = sample._height * percent;
          var offset = sample._height - height - 1;
          var barWidth = sample._width/times.length;
          drawContext.fillStyle = 'black';
          drawContext.fillRect(i * barWidth, offset, 1, 1);
        }
        requestAnimFrame(visualize.bind(analyser));
      };

      ////////////////////////////////////////////////////
      var localVideo = document.getElementById('localVideo');
      var remoteVideo = document.getElementById('remoteVideo');

      var handleUserMedia = function(stream) {
        console.log('handleUserMedia was called and passed', stream);
        socketService.localStream = stream;
        WebRtcService.sendMessage('got user media');
      };

      getMicrophoneInput(sample);

      socket.on('message', function(message) {
        console.log('Received message: ', message);
        if (message === 'got user media') {
          WebRtcService.maybeStart();
        } else if (message.type === 'offer') {
          console.log('received offer on client side');
          WebRtcService.maybeStart();
          socketService.pc.setRemoteDescription(new RTCSessionDescription(message));
          doAnswer();
        } else if (message.type === 'answer' && socketService.isStarted) {
          socketService.pc.setRemoteDescription(new RTCSessionDescription(message));
        } else if (message.type === 'candidate' && socketService.isStarted) {
          var candidate = new RTCIceCandidate({sdpMLineIndex:message.label,
            candidate:message.candidate});
          console.log('***candidate***: ', candidate);
          socketService.pc.addIceCandidate(candidate);
        } else if (message === 'bye' && socketService.isStarted) {
          handleRemoteHangup();
        }
      });

      var doAnswer = function() {
        console.log('Sending answer to peer.');
        socketService.pc.createAnswer(WebRtcService.setLocalAndSendMessage, null, WebRtcService.sdpConstraints);
      };

      WebRtcService.requestTurn('https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913');

      window.onbeforeunload = function(e) {
        sendMessage('bye');
      };

    };
  });
