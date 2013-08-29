'use strict';

//TODO clean up variable declarations

app.factory('socketService', function() {
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
    mediaConstraints: null,
    setSocket: function(s) {
      this.socket = s;
    }
  };
  return socketService;
});

app.factory('socket', function ($rootScope) {
  var socket = io.connect(window.location.origin);
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      });
    },
    removeAllListeners: function(eventName, callback){
      socket.removeAllListeners(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function() {
          if(callback) {
            callback.apply(socket, args);
          }
        });
      });
    }
  };
});

app.factory('WebRtcService', ['socketService', '$document', '$http', 'socket', 'User', function (socketService, $document, $http, socket, User) {
  var pcConfig = webrtcDetectedBrowser === 'firefox' ? {'iceServers':[{'url':'stun:23.21.150.121'}]} :{'iceServers': [{'url': 'stun:stun.l.google.com:19302'}]};
  var pcConstraints = {'optional': [{'DtlsSrtpKeyAgreement': true}]};
  var sdpConstraints = {'mandatory': {'OfferToReceiveAudio':true, 'OfferToReceiveVideo': true}};
  var turnExists;
  var remoteAudio = $document[0].getElementById('remoteAudio');
  var remoteVideo = $document[0].getElementById('remoteVideo');

  var sendMessage = function(message){
    console.log('Sending message: ', message);
    socket.emit('message', message);
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

  var mergeConstraints = function(cons1, cons2) {
    var merged = cons1;
    for (var name in cons2.mandatory) {
      merged.mandatory[name] = cons2.mandatory[name];
    }
    merged.optional.concat(cons2.optional);
    return merged;
  };

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
    console.log('************************************************remote stream added.');
    console.log('THIS LINE OF CODE ALSO FUCKING RUNSS!!!!!!!!')
    console.log('THIS IS USER.get()', User.get());
    console.log('WHY DOESNT THIS SHIT WORK?!')
    console.log('DOES THE USERS MEDIA TYPE EQUAL VVIDEO???', User.get().mediaType === 'video');
    var type = (User.get().mediaType === 'video' ? remoteVideo : remoteAudio);

    console.log('*********************************************type of media being set!', type);
    type = remoteVideo;
    attachMediaStream(type, event.stream);
    socketService.remoteStream = event.stream;
  };

  var handleRemoteStreamRemoved = function(event) {
    console.log('Remote stream removed. Event: ', event);
  };

  var setLocalAndSendMessage = function(sessionDescription) {
    // Set Opus as the preferred codec in SDP if Opus is present.
    sessionDescription.sdp = preferOpus(sessionDescription.sdp);
    socketService.pc.setLocalDescription(sessionDescription);
    sendMessage(sessionDescription);
  };

  var handleRemoteHangup = function () {
    console.log('Session terminated.');
    stop();
  };

  var stop = function () {
    socketService.isStarted = false;
    if (socketService.pc) {
      socketService.pc.close();
      socketService.pc = null;
    }
  };

  // Set Opus as the default audio codec if it's present.
  var preferOpus = function(sdp) {
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
  };

  var extractSdp = function(sdpLine, pattern) {
    var result = sdpLine.match(pattern);
    return result && result.length === 2 ? result[1] : null;
  };

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
  };

  // Strip CN from sdp before CN constraints is ready.
  var removeCN = function (sdpLines, mLineIndex) {
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
  };

  return {
    pcConfig: pcConfig,
    pcConstraints: pcConstraints,
    sdpConstraints: sdpConstraints,
    remoteAudio: remoteAudio,
    turnExists: turnExists,
    createPeerConnection: createPeerConnection,
    handleRemoteHangup: handleRemoteHangup,
    sendMessage: sendMessage,
    stop: stop,
    maybeStart: function() {
      console.log('maybe start is running on admin side');
      console.log('i am admin: ', socketService.isAdmin);
      !socketService.isStarted && socketService.isChannelReady && function() {
        if (socketService.isAdmin) {
          createPeerConnection();
          socketService.isStarted = true;
          doCall(); 
        } else if (socketService.localStream) {
         createPeerConnection();
         socketService.pc.addStream(socketService.localStream);
         socketService.isStarted = true;
        }
      }();
    },
    setLocalAndSendMessage: setLocalAndSendMessage,
    requestTurn: function (turn_url) {
      turnExists = false;
      for (var i in pcConfig.iceServers) {
        if (pcConfig.iceServers[i].url.substr(0, 5) === 'turn:') {
          turnExists = true;
          turnReady = true;
          break;
        }
      }
      if (!turnExists) {
        // refactor to use angular's $http service 
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function(){
          if (xhr.readyState === 4 && xhr.status === 200) {
            var turnServer = JSON.parse(xhr.responseText);
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
    }
  };
}]);

