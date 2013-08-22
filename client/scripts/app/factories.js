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

// app.factory('gUM', ['$document', function ($document) {
//   var audio = $document[0].createElement('audio');
//   return audio;
// }]);

// app.factory('WebRtcService', function ($rootScope) {

// });

