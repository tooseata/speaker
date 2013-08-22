'use strict';

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
      })
    }
  };
});

app.factory('WebRtcService', ['socketService', '$document', '$http', function (socketService,$document,$http) {
  var pcConfig = webrtcDetectedBrowser === 'firefox' ? {'iceServers':[{'url':'stun:23.21.150.121'}]} :{'iceServers': [{'url': 'stun:stun.l.google.com:19302'}]};
  var pcConstraints = {'optional': [{'DtlsSrtpKeyAgreement': true}]};
  var sdpConstraints = {'mandatory': {'OfferToReceiveAudio':true}};
  var remoteAudio = $document[0].getElementById('remoteAudio');
  var turnExists;

  return {
    requestTurn: function (turn_url) {
      debugger;
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

// app.factory('gUM', ['$document', function ($document) {
//   var audio = $document[0].createElement('audio');
//   return audio;
// }]);

// app.factory('WebRtcService', function ($rootScope) {

// });

