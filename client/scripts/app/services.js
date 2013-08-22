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
