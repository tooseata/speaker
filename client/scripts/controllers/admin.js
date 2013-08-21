'use strict';

angular.module('speakerApp')
  .factory('socketService', function() {
    var socketService = {
      socket: null,
      isChannelReady: null,
      isAdmin: null,
      isStarted: null,
      localStream: null,
      pc: null,
      remoteStream: null,
      turnReady: null,
      ready: null,
      setSocket: function(s) {
        this.socket = s;
      }
    }
    return socketService;
  })
  .controller('AdminCtrl', function ($scope, User, socketService, socket) {
    console.log('socket Admin', socket);
    $scope.user = User.get();
    if ($scope.user.type === 'admin') {
      socketService.isAdmin = true;
    } else {
      socketService.isAdmin = false;
    }
    $scope.members = 0;
    $scope.talkRequests = {};
    $scope.queueStatus = false;
    $scope.openQueue = function(){
      $scope.queueStatus = true;
      $scope.talkRequests = {};
    };
    $scope.closeQueue = function(){
      $scope.queueStatus = false;
    };
    socket.on('new:talkRequest', function (user) {
      console.log('talk request was called on admin side -- about to send event to client side');
      $scope.talkRequests[user.name] = user;
      socket.emit('clientIsChannelReady');
      socketService.isChannelReady = true;
    });
    socket.on('new:cancelTalkRequest', function (user) {
      delete $scope.talkRequests[user.name];
    });
    socket.on('new:leaveRoom', function (user) {
      console.log('a user left the room');
      console.log('for real this time');
      delete $scope.talkRequests[user.name];
      $scope.members--;
    });
    socket.on('new:joinRoom', function () {
      $scope.members++;
    });
    socket.on('new:checkQueueStatus', function (room) {
      if (room === $scope.user.room) {
        if ($scope.queueStatus) {
          socket.emit('broadcast:queueIsOpen');
        } else {
          socket.emit('broadcast:queueIsClosed');
        }
      }
    });
    socket.on('new:microphoneClickedOnClientSide', function() {
      socketService.ready = true;
    });

    $scope.fillRequest = function(name){
      console.log('emitting establishClientConnection from admin side');
      // socket.emit('broadcast:establishClientConnection');

      var pcConfig = webrtcDetectedBrowser === 'firefox' ?
          {'iceServers':[{'url':'stun:23.21.150.121'}]} : // number IP
          {'iceServers': [{'url': 'stun:stun.l.google.com:19302'}]};

      console.log(pcConfig);

      var pcConstraints = {'optional': [{'DtlsSrtpKeyAgreement': true}]};

        // Set up audio and video regardless of what devices are present.
        var sdpConstraints = {'mandatory': {
          'OfferToReceiveAudio':true
        }};

      ////////////////////////////////////

      var room = name;
      
      if (room !== '') {
        console.log('Create or join room ', room);
        socket.emit('create or join', room);
      }

      socket.on('created', function(room) {
        console.log('Created room ' + room);
      });

      socket.on('full', function(room) {
        console.log('Room ' + room + ' is full');
      });

      socket.on('join', function(room) {
        console.log('Another peer made a request to join room', room);
        console.log('This peer is the admin of room', room);
        socketService.isChannelReady = true;
      });

      socket.on('joined', function(room) {
        console.log('Another peer has joined the room', room);
        socketService.isChannelReady = true;
      });

      socket.on('log', function(array) {
        console.log.apply(console, array);
      });

      // MOVE TO ADMIN

              ///////////////////////////////////////////////////////

      var sendMessage = function(message){
        console.log('Sending message: ', message);
        socket.emit('message', message);
      };

      socket.on('message', function(message) {
        console.log('Received message: ', message);
        if (message === 'got user media') {

          maybeStart();
        } else if (message.type === 'offer') {
          if (!socketService.isAdmin && !socketService.isStarted) {
            maybeStart();
          }
          socketService.pc.setRemoteDescription(new RTCSessionDescription(message));
          doAnswer();
        } else if (message.type === 'answer' && socketService.isStarted) {
          socketService.pc.setRemoteDescription(new RTCSessionDescription(message));
        } else if (message.type === 'candidate' && socketService.isStarted) {
          var candidate = new RTCIceCandidate({sdpMLineIndex:message.label,
            candidate:message.candidate});
          console.log('candidate: ', candidate);
          console.log('CANDIDATE MESSAGE', message);
          socketService.pc.addIceCandidate(candidate);
        } else if (message === 'bye' && socketService.isStarted) {
          handleRemoteHangup();
        }
      });

        ////////////////////////////////////////////////////
        // var localVideo = document.getElementById('localVideo');
        var remoteAudio = document.getElementById('remoteAudio');
        console.log('line 134 called!');
        // var handleUserMedia = function(stream) {
        //   socketService.localStream = stream;
        //   attachMediaStream(localVideo, stream);
        //   console.log('Adding local stream.');
        //   sendMessage('got user media');
        //   console.log(socketService.isAdmin);
        //   if (socketService.isAdmin) {
        //     maybeStart();
        //   }
        // };

        // function handleUserMediaError(error){
        //   console.log('navigator.getUserMedia error: ', error);
        // }

        // var constraints = {audio: true};
        // getUserMedia(constraints, handleUserMedia, handleUserMediaError);
        // console.log('Getting user audio');

      var maybeStart = function() {
        console.log('maybe start is running on admin side');
        console.log('i am admin: ', socketService.isAdmin);
        console.log('isStarted: ', socketService, 'isAdmin: ', socketService.isAdmin, 'isChannelready: ', socketService.isChannelReady);
        if (!socketService.isStarted && socketService.isAdmin && socketService.ready && socketService.isChannelReady) {
          createPeerConnection();
          // socketService.pc.addStream(socketService.localStream);
          socketService.isStarted = true;
          if (socketService.isAdmin) {
            doCall();
          }
        }
      };

      var requestTurn = function (turn_url) {
        var turnExists = false;
        for (var i in pcConfig.iceServers) {
          if (pcConfig.iceServers[i].url.substr(0, 5) === 'turn:') {
            turnExists = true;
            turnReady = true;
            break;
          }
        }
        if (!turnExists) {
          console.log('Getting TURN server from ', turn_url);
          // No TURN server. Get one from computeengineondemand.appspot.com:
          var xhr = new XMLHttpRequest();
          xhr.onreadystatechange = function(){
            if (xhr.readyState === 4 && xhr.status === 200) {
              var turnServer = JSON.parse(xhr.responseText);
              console.log('Got TURN server: ', turnServer);
              pcConfig.iceServers.push({
                'url': 'turn:' + turnServer.username + '@' + turnServer.turn,
                'credential': turnServer.password
              });
              turnReady = true;
            }
          };
          xhr.open('GET', turn_url, true);
          xhr.send();
        }
      };

      requestTurn('https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913');

      window.onbeforeunload = function(e) {
        sendMessage('bye');
      };

      ////////////////////////////////////////////////////////

      var createPeerConnection = function() {
        try {
          socketService.pc = new RTCPeerConnection(pcConfig, pcConstraints);
          socketService.pc.onicecandidate = handleIceCandidate;
          console.log('Created RTCPeerConnection with:\n' +
            ' config: \'' + JSON.stringify(pcConfig) + '\';\n' +
            '  constraints: \'' + JSON.stringify(pcConstraints) + '\'.');
        } catch (e) {
          console.log('Failed to create PeerConnection, exception: ' + e.message);
          alert('Cannot create RTCPeerConnection object.');
            return;
        }
        socketService.pc.onaddstream = handleRemoteStreamAdded;
        socketService.pc.onremovestream = handleRemoteStreamRemoved;
      };

      var handleIceCandidate = function(event) {
        console.log('handleIceCandidate event: ', event);
        if (event.candidate) {
          sendMessage({
            type: 'candidate',
            label: event.candidate.sdpMLineIndex,
            id: event.candidate.sdpMid,
            candidate: event.candidate.candidate
          });
        }
      };

      var handleRemoteStreamAdded = function(event) {
        console.log('Remote stream added.');
        attachMediaStream(remoteVideo, event.stream);
        remoteStram = event.stream;
      };

      var doCall = function() {
        var constraints = {'optional': [], 'mandatory': {'MozDontOfferDataChannel': true}};
        if (webrtcDetectedBrowser === 'chrome') {
          for (var prop in constraints.mandatory) {
            if (prop.indexOf('Moz') !== -1) {
              delete constraints.mandatory[prop];
            }
          }
        }
        constraints = mergeConstraints(constraints, sdpConstraints);
        console.log('Sending offer to peer with constraints: \n' +
          '  \'' + JSON.stringify(constraints) + '\'.');
        socketService.pc.createOffer(setLocalAndSendMessage, null, constraints);
      };

      var doAnswer = function() {
        console.log('Sending answer to peer.');
        socketService.pc.createAnswer(setLocalAndSendMessage, null, sdpConstraints);
      };

      var mergeConstraints = function(cons1, cons2) {
        var merged = cons1;
        for (var name in cons2.mandatory) {
          merged.mandatory[name] = cons2.mandatory[name];
        }
        merged.optional.concat(cons2.optional);
        return merged;
      };

      var setLocalAndSendMessage = function(sessionDescription) {
        // Set Opus as the preferred codec in SDP if Opus is present.
        sessionDescription.sdp = preferOpus(sessionDescription.sdp);
        socketService.pc.setLocalDescription(sessionDescription);
        sendMessage(sessionDescription);
      };

      var handleRemoteStreamAdded = function(event) {
        console.log('remote stream added.');

        attachMediaStream(remoteAudio, event.stream);
        socketService.remoteStream = event.stream;
      };

      var handleRemoteStreamRemoved = function(event) {
        console.log('Remote stream removed. Event: ', event);
      };

      var hangup = function() {
        console.log('Hanging up.');
        stop();
        sendMessage('bye');
      };

      var handleRemoteHangup = function () {
        console.log('Session terminated.');
        stop();
        isInitiator = false;
      };

      var stop = function () {
        socketService.isStarted = false;
        // isAudioMuted = false;
        // isVideoMuted = false;
        socketService.pc.close();
        socketService.pc = null;
      };

      ///////////////////////////////////////////

      // Set Opus as the default audio codec if it's present.
      function preferOpus(sdp) {
        var sdpLines = sdp.split('\r\n');
        var mLineIndex;
        // Search for m line.
        for (var i = 0; i < sdpLines.length; i++) {
            if (sdpLines[i].search('m=audio') !== -1) {
              mLineIndex = i;
              break;
            }
        }
        if (mLineIndex === null) {
          return sdp;
        }

        // If Opus is available, set it as the default in m line.
        for (i = 0; i < sdpLines.length; i++) {
          if (sdpLines[i].search('opus/48000') !== -1) {
            var opusPayload = extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
            if (opusPayload) {
              sdpLines[mLineIndex] = setDefaultCodec(sdpLines[mLineIndex], opusPayload);
            }
            break;
          }
        }

        // Remove CN in m line and sdp.
        sdpLines = removeCN(sdpLines, mLineIndex);

        sdp = sdpLines.join('\r\n');
        return sdp;
      }

      function extractSdp(sdpLine, pattern) {
        var result = sdpLine.match(pattern);
        return result && result.length === 2 ? result[1] : null;
      }

      // Set the selected codec to the first in m line.
      function setDefaultCodec(mLine, payload) {
        var elements = mLine.split(' ');
        var newLine = [];
        var index = 0;
        for (var i = 0; i < elements.length; i++) {
          if (index === 3) { // Format of media starts from the fourth.
            newLine[index++] = payload; // Put target payload to the first.
          }
          if (elements[i] !== payload) {
            newLine[index++] = elements[i];
          }
        }
        return newLine.join(' ');
      }

      // Strip CN from sdp before CN constraints is ready.
      function removeCN(sdpLines, mLineIndex) {
        var mLineElements = sdpLines[mLineIndex].split(' ');
        // Scan from end for the convenience of removing an item.
        for (var i = sdpLines.length-1; i >= 0; i--) {
          var payload = extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
          if (payload) {
            var cnPos = mLineElements.indexOf(payload);
            if (cnPos !== -1) {
              // Remove CN payload from m line.
              mLineElements.splice(cnPos, 1);
            }
            // Remove CN line in sdp
            sdpLines.splice(i, 1);
          }
        }
        sdpLines[mLineIndex] = mLineElements.join(' ');
        return sdpLines;
      }
      if (socketService.isAdmin) {
        maybeStart();
      }
    };
  });

