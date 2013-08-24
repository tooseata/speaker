'use strict';

app.service('User', function(){
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
    },
    set: function(userObj){
      user = userObj;
    },
    kill: function(){
      user.type = '';
      user.name = '';
      user.room = '';
    }
  };
});

app.service('Room', function() {
  var room = {
    talkRequests: {},
    memberCount: 0,
    talker: ''
  };
  return {
    get: function() {
      return room;
    },
    setTalkRequests: function(talkRequests) {
      room.talkRequests = talkRequests;
    },
    setMemberCount: function(memberCount) {
      room.memberCount = memberCount;
    },
    setTalker: function(talker) {
      room.talker = talker;
    }
  };
});
app.service('Session', function($http){
  return {
    existingRooms: function(scope){
      $http.get('/rooms').success(function(data){
        scope.existingRooms = data;
      }).error(function(){
        console.log('error on room collection.');
      });
    }
  };
});
