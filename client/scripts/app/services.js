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

app.service('Talker', function() {
  var talker = '';
  return {
    get: function() {
      return talker;
    },
    set: function(username) {
      talker = username;
    }
  };
});
