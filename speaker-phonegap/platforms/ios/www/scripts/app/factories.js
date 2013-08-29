'use strict';

//TODO clean up variable declarations

app.factory('socketService', function () {
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
    setSocket: function (s) {
      this.socket = s;
    }
  };
  return socketService;
});

app.factory('socket', function ($rootScope) {
  var socket = io.connect('http://10.0.1.29:3000');
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
    removeAllListeners: function (eventName, callback) {
      socket.removeAllListeners(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      });
    }
  };
});