'use strict';

angular.module('speakerApp')
.controller('JoinCtrl', function ($scope, $location, $http, User, socket, Session) {
            // Scope variables.
            Session.existingRooms($scope);
            $scope.user = User.get();
            
            $scope.update = function(userName, room) {
            
            User.setType('user');
            User.setName(userName);
            User.setRoom(room);
            $scope.user = User.get();
            socket.emit('broadcast:joinRoom', $scope.user);
            $http.post('/session', JSON.stringify($scope.user));
            $location.path('/talk');
            };
            
            $scope.validateRoom = function(room){
            return $scope.existingRooms[room];
            };
            
            $scope.validateName = function(name){
            return !$scope.existingRooms[$scope.room].members[name];
            };
            });
