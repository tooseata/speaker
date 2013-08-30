'use strict';

angular.module('speakerApp')
  .controller('MainCtrl', function ($scope, $cookies, Session, $location, User) {
    if (!$cookies.session){
      $cookies.session = Math.floor(Math.random() * 100000000000000).toString();
    }
    Session.isAdmin();

    $scope.user = User.get();
    var browserCheck = function () {
      if(Modernizr.getusermedia){
        $location.path('/');
      } else {
        $location.path('/browsersupport');
      }
      if(Modernizr.audiodata && Modernizr.webaudio) {
        User.setProfile("webAudio", "true");
      } else {
        User.setProfile("webAudio", "false");
      } 
      if (Modernizr.touch){
        User.setProfile("touchable", "true");
      } else{
        User.setProfile("touchable", "false");
      }
      if (Modernizr.ipad || Modernizr.iphone || Modernizr.ipod || Modernizr.appleios){
        alert("We have an application on the IOS store, Go there");
      }
    };
    browserCheck();
    // Initialize API key, session, and token...
    // Think of a session as a room, and a token as the key to get in to the room
    // Sessions and tokens are generated on your server and passed down to the client
    var apiKey = '39238222';
    var sessionId = '2_MX4zOTIzODIyMn4xMjcuMC4wLjF-VHVlIEF1ZyAyNyAxMjoyMTowMCBQRFQgMjAxM34wLjk4NjQwOTA3fg';
    var token = 'T1==cGFydG5lcl9pZD0zOTIzODIyMiZzZGtfdmVyc2lvbj10YnJ1YnktdGJyYi12MC45MS4yMDExLTAyLTE3JnNpZz1hYzUwMDI5Mzg0NjQ5MzFjM2EzYzU0MzM0OWNmMDY5YTZjZTk2MWNjOnJvbGU9cHVibGlzaGVyJnNlc3Npb25faWQ9Ml9NWDR6T1RJek9ESXlNbjR4TWpjdU1DNHdMakYtVkhWbElFRjFaeUF5TnlBeE1qb3lNVG93TUNCUVJGUWdNakF4TTM0d0xqazROalF3T1RBM2ZnJmNyZWF0ZV90aW1lPTEzNzc2MzEyNjEmbm9uY2U9MC43ODIyMTI5OTE0MDUxNTA5JmV4cGlyZV90aW1lPTEzNzc3MTc2NjEmY29ubmVjdGlvbl9kYXRhPQ==';

    // Enable console logs for debugging
    TB.setLogLevel(TB.DEBUG);

    // Initialize session, set up event listeners, and connect
    var session = TB.initSession(sessionId);
    session.addEventListener('sessionConnected', sessionConnectedHandler);
    session.connect(apiKey, token);
    function sessionConnectedHandler(event) {
      // Subscribe to streams that were in the session when we connected
      subscribeToStreams(event.streams);
    }

    function subscribeToStreams(streams) {
      for (var i = 0; i < streams.length; i++) {
        // Create the div to put the subscriber element in to
        var div = document.createElement('div');
        div.setAttribute('id', 'stream' + streams[i].streamId);
        document.body.appendChild(div);

        // Subscribe to the stream
        session.subscribe(streams[i], div.id);
      }
    }
  });
