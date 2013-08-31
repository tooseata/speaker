'use strict';
angular.module('speakerApp')
  .controller('MainCtrl', function ($scope, $cookies, Session, $location, User, $http) {
    if (!$cookies.session){
      $cookies.session = Math.floor(Math.random() * 100000000000000).toString();
    }
    Session.isAdmin();
    Session.existingRooms($scope);
    $scope.user = User.get();
    $scope.badInput = false;
    $scope.validateRoom = function(room){
      return $scope.existingRooms[room];
    };
    $scope.join = function(room){
      if ($scope.validateRoom(room)){
        $location.path('/join/' + room);
      } else {
        $scope.badInput = true;
      }
    }
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
