'use strict';

app.service('User', function(){
  var user = {
    type:'',
    name:'',
    room:'',
    mediaType:''
  };
  return {
    get: function(){
      return user;
    },
    setName: function(userName){
      user.name = userName;
    },
    setMediaType: function(mediaType){
      user.mediaType = mediaType;
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
    },
    getTalker: function() {
      return room.talker;
    }
  };
});
app.service('Session', function($http, $location, User, Room, socket){
  return {
    existingRooms: function(scope){
      $http.get('/rooms').success(function(data){
        scope.existingRooms = data;
      }).error(function(){
        console.log('error on room collection.');
      });
    },
    user: function(scope){
      if (User.get().type === ''){
        $http.get('/session').success(function(data){
          if (data.type !== ''){
            User.set(data);
            scope.user = User.get();
          } else {
            $location.path('/');
          }
        });
      }
    },
    userRoom: function(scope){
      if (User.get().type === ''){
        $http.get('/session').success(function(data){
          if (data.type !== ''){
            User.set(data);
            scope.user = User.get();
            socket.emit('broadcast:join', scope.user);
            $http.get('/room/' + scope.user.room + '').success(function(room){
              if (room.talkRequests){
                scope.talkRequests = room.talkRequests;
                scope.memberCount = countMembers(room.members);
              } else {
                $location.path('/');
              }
            });
          } else {
            $location.path('/');
          }
        });
      }
    },
    isAdmin: function(){
      $http.get('/session').success(function(data){
        if (data.type === 'admin'){
          User.set(data);
          window.confirm('You are the admin of a room, would you like to return to it?') ? $location.path('/admin') : socket.emit('broadcast:closeRoom', User.get());
        }
      });
    },
    questions: function(scope){
      $http.get('/messages').success(function(data){
        if (Object.keys(data).length){
          _.each(data, function(question, key){
            scope.questions.push({key: key, question: question.question, user: question.user});
            scope.upVoted[key] = false;
          });
        }
      });
    }
  };
});
var countMembers = function(members){
  var count = 0;
  _.each(members, function(){
    count++;
  });
  return count;
};
