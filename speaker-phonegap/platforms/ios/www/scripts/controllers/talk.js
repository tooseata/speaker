'use strict';

angular.module('speakerApp')
.controller('TalkCtrl', function ($scope, $location, User, Session, socketService, socket, $http, $window) {
            
            Session.user($scope);
            $scope.user = User.get();
            $scope.sentRequest = false;
            $scope.joined = false;
            $scope.canTalk = false;
            $scope.sentQuestion = false;
            $scope.question = '';
            
            
            socket.on('new:clientIsChannelReady', function(){
                      console.log('received client is channel ready from server');
                      socketService.isChannelReady = true;
                      });
            
            $scope.cancelTalkRequest = function(){
            socket.emit('broadcast:cancelTalkRequest', $scope.user);
            $scope.sentRequest = false;
            };
            
            socket.on('new:queueIsClosed', function(user) {
                      $scope.sentRequest = false;
                      window.alert('The admin is not accepting talk requests right now.', user);
                      });
            
            socket.on('new:closeRequest', function(){
                      $scope.sentRequest = false;
                      });
            
            socket.on('new:closeRoom', function() {
                      socket.emit('broadcast:leave', $scope.user);
                      socket.removeAllListeners('new:closeRoom');
                      User.kill();
                      $scope.user = User.get();
                      $location.path('/');
                      window.alert('The admin closed the room.');
                      });
            $scope.submitQuestion = function(){
            console.log($scope.question);
            socket.emit('question:new', {question: $scope.question, user: $scope.user});
            $scope.sentQuestion = true;
            };
            
           
           
            
            $window.onbeforeunload = function(e) {
                socket.emit('broadcast:cancelTalkRequest', $scope.user);
                $scope.sentRequest = false;
                };
            });
