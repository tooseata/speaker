'use strict';

angular.module('speakerApp')
  .controller('TalkCtrl', function ($document, $scope, $location, User, Session, socketService, socket, WebRtcService, $http, $window) {

    Session.user($scope);
    $scope.user = User.get();
    $scope.sentAudioRequest = false;
    $scope.sentVideoRequest = false;
    $scope.joined = false;
    $scope.canTalk = true;
    $scope.sentQuestion = false;
    $scope.question = '';
    $scope.localstream;
    $scope.pendingRequest = false;
    $scope.liveAudioRequest = false;
    var localVideo;



    socket.on('new:clientIsChannelReady', function(){
      console.log('received client is channel ready from server');
      socketService.isChannelReady = true;
    });

    $scope.leaveRoom = function(){
      alert('TODO:: we need an "are you sure?" here');
      socket.emit('broadcast:leaveRoom', $scope.user);
      socket.emit('broadcast:cancelTalkRequest', $scope.user);
      $scope.sentRequest = false;
      $location.path('/');
    };

    $scope.logTest  = function(){
      console.log('You touched Me');
    };

    $scope.cancelTalkRequest = function(){
      socket.emit('broadcast:cancelTalkRequest', $scope.user);
      $scope.sentAudioRequest = false;
      $scope.sentVideoRequest = false;
      $('#localVideo').remove();
    };

    socket.on('new:queueIsClosed', function(user) {
      $scope.canTalk = false;
      window.alert('The admin is not accepting talk requests right now.', user);
    });

    // Event to notify the client that the admin closed their connection 
    socket.on('new:closeRequest', function(){
      console.log('NEW CLOSE REQUEST');
      $scope.sentAudioRequest = false;
      $scope.sentVideoRequest = false;
      $scope.localstream.stop();
    });

    socket.on('new:closeRoom', function() {
      socket.emit('broadcast:leave', $scope.user);
      socket.removeAllListeners('new:closeRoom');
      User.kill();
      $scope.user = User.get();
      $location.path('/');
      window.alert('The admin closed the room.');
    });

    $scope.submitQuestion = function(){
      console.log($scope.question);
      socket.emit('question:new', {question: $scope.question, user: $scope.user});
      $scope.sentQuestion = true;
    };

    $scope.requestVideo = function() {
      console.log('trigger video');
      WebRtcService.sendMessage({type: 'media type', value: 'video'});
      localVideo = document.querySelector('#localVideo');
      console.log('is there any video??????, ', localVideo);
      if (!localVideo) {
        localVideo = document.createElement('video');
        document.body.appendChild(localVideo);
        localVideo.setAttribute('id', 'localVideo');
        localVideo.setAttribute('autoplay', 'true');
        localVideo = document.querySelector('#localVideo');
        console.log(localVideo);
      }
      var constraints = {audio: true, video: true};

      var onStreamError = function(e) {
        console.error('Error getting video', e);
      };

      var onVideoStream = function(stream) {
        socket.emit('broadcast:talkRequest', $scope.user);
        $scope.sentVideoRequest = true;
        $scope.pendingRequest = true;
        $scope.localstream = stream;
        handleUserMedia(stream, {video: true});
      };
      getUserMedia(constraints, onVideoStream, onStreamError);
    };

    $scope.requestAudio = function(){
      WebRtcService.sendMessage({type: 'media type', value: 'audio'});
      // var MicrophoneSample = function() {
      //   this._width = 640;
      //   this._height = 480;
      //   this.canvas = document.querySelector('canvas');
      // };
      // var sample = new MicrophoneSample();
      // var context = new webkitAudioContext();
      // var analyser = context.createAnalyser();
      // // shim layer with setTimeout fallback
      // var requestAnimFrame = (function(){
      //   return  window.requestAnimationFrame       ||
      //           window.webkitRequestAnimationFrame ||
      //           window.mozRequestAnimationFrame    ||
      //           window.oRequestAnimationFrame      ||
      //           window.msRequestAnimationFrame     ||
      //     function( callback ){
      //     window.setTimeout(callback, 1000 / 60);
      //     };
      // })();

      // getUserMedia(constraints, handleUserMedia, )
      // var getMicrophoneInput = function (source) {
      //   getUserMedia({audio: true}, onStream, onStreamError);
      // };

      var onStream = function(stream) {
        socket.emit('broadcast:microphoneClickedOnClientSide', $scope.user);
        // var input = context.createMediaStreamSource(stream);
        // var filter = context.createBiquadFilter();
        // filter.frequency.value = 6600.0;
        // filter.type = filter.NOTCH;
        // filter.Q = 10.0;
        // // Connect graph.
        // input.connect(filter);
        // filter.connect(analyser);
        // requestAnimFrame(visualize.bind(analyser));
        socket.emit('broadcast:talkRequest', $scope.user);
        $scope.sentAudioRequest = true;
        $scope.pendingRequest = true;
        handleUserMedia(stream);
      };

      var onStreamError = function(e) {
        console.error('Error getting microphone', e);
      };

      // var visualize = function() {
      //   sample.canvas.width = sample._width;
      //   sample.canvas.height = sample._height;
      //   var drawContext = sample.canvas.getContext('2d');

      //   var times = new Uint8Array(analyser.frequencyBinCount);
      //   analyser.getByteTimeDomainData(times);
      //   for (var i = 0; i < times.length; i++) {
      //     var value = times[i];
      //     var percent = value / 256;
      //     var height = sample._height * percent;
      //     var offset = sample._height - height - 1;
      //     var barWidth = sample._width/times.length;
      //     drawContext.fillStyle = 'black';
      //     drawContext.fillRect(i * barWidth, offset, 1, 1);
      //   }
      //   requestAnimFrame(visualize.bind(analyser));
      // };

      getUserMedia({audio: true}, onStream, onStreamError);

      // getMicrophoneInput(sample);
    };

    var handleUserMedia = function(stream, type) {
      console.log('handleUserMedia was called and passed', stream);
      socketService.localStream = stream;
      // If a type was passed into handleUserMedia call attachMediaStream on the localVideo node

      if (arguments[1]) {
        attachMediaStream(localVideo, stream);
      }
      WebRtcService.maybeStart();
    };

    socket.on('message', function(message) {
      console.log('Received message: ', message);
      if (message.type === 'offer') {
        console.log('received offer on client side');
        WebRtcService.maybeStart();
        socketService.pc.setRemoteDescription(new RTCSessionDescription(message));
        doAnswer();
      } else if (message.type === 'answer' && socketService.isStarted) {
        socketService.pc.setRemoteDescription(new RTCSessionDescription(message));
      } else if (message.type === 'candidate' && socketService.isStarted) {
        console.log('I am running from client RTCIceCandidate - candidate');
        var candidate = new RTCIceCandidate({sdpMLineIndex:message.label,
          candidate:message.candidate});
        console.log('Candidate on Client: ', candidate);
        socketService.pc.addIceCandidate(candidate);
      } else if (message === 'bye' && socketService.isStarted) {
        WebRtcService.handleRemoteHangup();
      }
    });

    var doAnswer = function() {
      console.log('Sending answer to peer.');
      $scope.liveAudioRequest = true;
      $scope.pendingRequest = false;
      socketService.pc.createAnswer(WebRtcService.setLocalAndSendMessage, null, WebRtcService.sdpConstraints);
    };

    // WebRtcService.requestTurn('https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913');

    $window.onbeforeunload = function() {
      socket.emit('broadcast:leaveRoom', $scope.user);
      socket.emit('broadcast:cancelTalkRequest', $scope.user);
      $scope.sentAudioRequest = false;
      $scope.sentVideoRequest = false;
    };

    function Carousel(element) {
      var self = this;
      element = $(element);

      var container = $('>div.slideScreen', element);
      var panes = $('>div.slideScreen>span', element);

      var paneWidth = 0;
      var paneCount = panes.length;

      var currentPane = 0;


      /**
       * initial
       */
      this.init = function() {
        setPaneDimensions();

        $(window).on('load resize orientationchange', function() {
          setPaneDimensions();
            //updateOffset();
        });
      };


      /**
       * set the pane dimensions and scale the container
       */
      function setPaneDimensions() {
        paneWidth = element.width();
        panes.each(function() {
          $(this).width(paneWidth);
        });
        container.width(paneWidth*paneCount);
      }


      /**
       * show pane by index
       * @param   {Number}    index
       */
      this.showPane = function( index ) {
        // between the bounds
        index = Math.max(0, Math.min(index, paneCount-1));
        currentPane = index;

        var offset = -((100/paneCount)*currentPane);
        setContainerOffset(offset, true);
      };


      function setContainerOffset(percent, animate) {
        container.removeClass('animate');

        if(animate) {
          container.addClass('animate');
        }

        if(Modernizr.csstransforms3d) {
          container.css('transform', 'translate3d('+ percent +'%,0,0) scale3d(1,1,1)');
        }
        else if(Modernizr.csstransforms) {
          container.css('transform', 'translate('+ percent +'%,0)');
        }
        else {
          var px = ((paneWidth*paneCount) / 100) * percent;
          container.css('left', px+'px');
        }
      }

      this.next = function() { return this.showPane(currentPane+1, true); };
      this.prev = function() { return this.showPane(currentPane-1, true); };



      function handleHammer(ev) {
        console.log(ev);
        // disable browser scrolling
        ev.gesture.preventDefault();

        switch(ev.type) {
        case 'dragright':
        case 'dragleft':
          // stick to the finger
          var paneOffset = -(100/paneCount)*currentPane;
          var dragOffset = ((100/paneWidth)*ev.gesture.deltaX) / paneCount;

          // slow down at the first and last pane
          if((currentPane === 0 && ev.gesture.direction === Hammer.DIRECTION_RIGHT) ||
            (currentPane === paneCount-1 && ev.gesture.direction === Hammer.DIRECTION_LEFT)) {
            dragOffset *= 0.4;
          }

          setContainerOffset(dragOffset + paneOffset);
          break;

        case 'swipeleft':
          self.next();
          ev.gesture.stopDetect();
          break;

        case 'swiperight':
          self.prev();
          ev.gesture.stopDetect();
          break;

        case 'release':
          // more then 50% moved, navigate
          if(Math.abs(ev.gesture.deltaX) > paneWidth/2) {
            if(ev.gesture.direction === 'right') {
              self.prev();
            } else {
              self.next();
            }
          } else {
            self.showPane(currentPane, true);
          }
          break;
        }
      }
      element.hammer({ drag_lock_to_axis: true })
      .on('release dragleft dragright swipeleft swiperight', handleHammer);
    }
    var carousel = new Carousel('#transistion-screen');
    carousel.init();
  });
