'use strict';
angular.module('speakerApp')
  .controller('MainCtrl', function ($scope, $cookies, Session, socket, $location, User, $http, $modal) {
    $scope.isMobile = false;
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
        var modal = $modal({
          template: './../views/partials/joinModal.html',
          show: true,
          backdrop: 'static',
          scope: $scope
        });
        User.setRoom(room);
      } else {
        $scope.badInput = true;
      }
    };
    $scope.modalService = function(){
    };

    $scope.update = function(userName) {
      User.setType('user');
      User.setName(userName);
      $scope.user = User.get();
      socket.emit('broadcast:joinRoom', $scope.user);
      $http.post('/session', JSON.stringify($scope.user));
      $scope.dismiss()
      $location.path('/talk');

    };

    $scope.validateName = function(name){
      return !$scope.existingRooms[$scope.room].members[name];
    };

    var browserCheck = function () {
      if(Modernizr.getusermedia){
        User.setProfile("getusermedia", true);
      } else {
        User.setProfile("getusermedia", false);
      }
      if(Modernizr.audiodata && Modernizr.webaudio) {
        User.setProfile("webAudio", true);
      } else {
        User.setProfile("webAudio", false);
      }
      if (Modernizr.touch){
        User.setProfile("touchable", true);
      } else{
        User.setProfile("touchable", false);
      }
      if (Modernizr.ipad || Modernizr.iphone || Modernizr.ipod || Modernizr.appleios){
        $scope.isMobile = true;
      }
    };

    browserCheck();

    var landings = [
      'Let your audience be heard.', 'Revolutionizing Q&A.',
      'A new kind of microphone.', 'Painless Q&A.',
      'The world\'s first virtual microphone.', 'Let them speak.'
    ];
    $scope.splashPhrase = landings[Math.floor(Math.random()*(landings.length - 1))];

    
  });
