'use strict';

angular.module('speakerApp', [])
  .service('User', function(){
    var user = {
      type:'',
      name:'',
      room:''
    };
    return {
      get: function(){
        return user;
      },
      setName: function(userName){
        user.name = userName;
      },
      setRoom: function(room){
        user.room = room;
      },
      setType: function(type){
        user.type = type;
      }
    };
  })
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/join', {
        templateUrl: 'views/join.html',
        controller: 'JoinCtrl'
      })
      .when('/create', {
        templateUrl: 'views/create.html',
        controller: 'CreateCtrl'
      })
      .when('/talk', {
        templateUrl: 'views/talk.html',
        controller: 'TalkCtrl'
      })
      .when('/admin', {
        templateUrl: 'views/admin.html',
        controller: 'AdminCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });