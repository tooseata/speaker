'use strict';

angular.module('speakerApp')
  .controller('TalkCtrl', function ($document, $scope, $location, User, Session, socketService, socket, WebRtcService, $http, $window) {

    Session.user($scope);
    $scope.user = User.get();
    $scope.sentAudioRequest = false;
    $scope.sentVideoRequest = false;
    $scope.joined = false;
    $scope.canTalk = true;
    $scope.sentQuestion = true;
    $scope.question = '';
    $scope.localstream;
    $scope.pendingRequest = false;
    $scope.liveAudioRequest = false;
    $scope.updateMessage = 'Welcome to Speaker! Submit and upvote questions below, then when you\'re ready, request the floor.';
    var localVideo;

    socket.on('new:clientIsChannelReady', function(){
      socketService.isChannelReady = true;
    });

    $scope.leaveRoom = function(){
      socket.emit('broadcast:leaveRoom', $scope.user);
      socket.emit('broadcast:cancelTalkRequest', $scope.user);
      $scope.sentRequest = false;
      $location.path('/');
    };

    $scope.cancelTalkRequest = function(){
      socket.emit('broadcast:cancelTalkRequest', $scope.user);
      $scope.sentAudioRequest = false;
      $scope.sentVideoRequest = false;
      $scope.localstream.stop();
      $('#localVideo').hide();
    };

    socket.on('new:queueIsClosed', function(user) {
      $scope.canTalk = false;
      alert('The presenter has not yet opened the floor for questions. Go back and vote!');
      $scope.updateMessage = 'The presenter has not yet opened the floor for questions. Keep an eye up here and we\'ll keep you posted.';
    });

    // Event to notify the client that the admin closed their connection
    socket.on('new:closeRequest', function(){
      $scope.sentAudioRequest = false;
      $scope.sentVideoRequest = false;
      $scope.updateMessage = 'Thanks for asking your question!';
      $scope.localstream.stop();
      $('#localVideo').hide();
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
      WebRtcService.sendMessage({type: 'media type', value: 'video'});
      localVideo = document.querySelector('#localVideo');
      // if (localVideo.src)
      // if (!localVideo) {
      //   localVideo = document.createElement('video');
      //   document.body.appendChild(localVideo);
      //   localVideo.setAttribute('id', 'localVideo');
      //   localVideo.setAttribute('autoplay', 'true');
      //   localVideo = document.querySelector('#localVideo');
      //   console.log(localVideo);
      // }
      var constraints = {audio: true, video: true};

      var onStreamError = function(e) {
        console.error('Error getting video', e);
      };

      var onVideoStream = function(stream) {
        socket.emit('broadcast:talkRequest', $scope.user);
        $scope.updateMessage = 'what upppp.';
        $scope.sentVideoRequest = true;
        $scope.pendingRequest = true;
        $scope.localstream = stream;
        handleUserMedia(stream, {video: true});
      };
      getUserMedia(constraints, onVideoStream, onStreamError);
    };

    $scope.requestAudio = function(){
      WebRtcService.sendMessage({type: 'media type', value: 'audio'});
      var onStream = function(stream) {
        $scope.localstream = stream;
        socket.emit('broadcast:microphoneClickedOnClientSide', $scope.user);
        socket.emit('broadcast:talkRequest', $scope.user);
        $scope.sentAudioRequest = true;
        $scope.pendingRequest = true;
        handleUserMedia(stream);
      };
      var onStreamError = function(e) {
        console.error('Error getting microphone', e);
      };
      getUserMedia({audio: true}, onStream, onStreamError);
    };

    var handleUserMedia = function(stream, type) {
      console.log('handleUserMedia was called and passed', stream);
      socketService.localStream = stream;
      // If a type was passed into handleUserMedia call attachMediaStream on the localVideo node

      if (arguments[1]) {
        if (localVideo.src) {
          $('#localVideo').show();
        }
        attachMediaStream(localVideo, stream);
      }
      WebRtcService.maybeStart();
    };

    socket.on('message', function(message) {
      console.log('Received message: ', message);
      if (message.type === 'offer') {
        WebRtcService.maybeStart();
        socketService.pc.setRemoteDescription(new RTCSessionDescription(message));
        doAnswer();
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

    var doAnswer = function() {
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

    $scope.next = function(){
      carousel.next();
    };

    $scope.prev = function(){
      carousel.prev();
    };

  });
