'use strict';

angular.module('speakerApp')
  .controller('UserCtrl', function ($scope) {
    var onSuccess = function(stream) {
      // Audio stream can be accessed here
    };
    var onError = function() {
      // Called when user denies access to mic
    };
    navigator.getMedia = (navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia);
    navigator.getMedia({audio: true}, onSuccess, onError);
  });