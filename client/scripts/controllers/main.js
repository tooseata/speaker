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
  });
