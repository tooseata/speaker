'use strict';
angular.module('speakerApp')
  .controller('TalkCtrl', function ($scope, User, socketService, socket, WebRtcService) {
    
    $scope.user = User;
    $scope.sentRequest = false;
    $scope.joined = false;

    socket.on('new:establishClientConnection', function() {
      console.log('establishClientConnection request received on client side');
          $scope.requestAudio();
      });

    socket.on('new:queueIsOpen', function(user) {
        if (user.name === $scope.user.get().name) {
          $scope.sendTalkRequest();
        }
      });

    socket.on('new:queueIsClosed', function(user) {
      //TODO :: dynamically re-render HTML to display a message that the queue is closed
      if (user.name === $scope.user.get().name) {
        alert('queue is closed');
      }
    });

    socket.on('clientIsChannelReady-client', function(){
      console.log('clientIsChannelReady CALLED ON CLIENT SIDE');
      socketService.isChannelReady = true;
      console.log('setting isChannelReady on Client');
      $scope.requestAudio();
    });

    $scope.maybeSendTalkRequest = function() {
      socket.emit('broadcast:checkQueueStatus', {user : $scope.user.get()});
    };

    $scope.sendTalkRequest = function(){
      console.log('sendTalkRequest was called');
      socket.emit('broadcast:talkRequest', {user : $scope.user.get()});
      $scope.sentRequest = true;
    };
    $scope.cancelTalkRequest = function(){
      socket.emit('broadcast:cancelTalkRequest', {user : $scope.user.get()});
      $scope.sentRequest = false;
    };
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
