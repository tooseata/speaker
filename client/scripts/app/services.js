'use strict';

app.service('User', function($http){
  var user = {
    type:'',
    name:'',
    room:'',
    mediaType:'',
    karma: 0,
    browserProfile: {}
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
    setProfile: function(type, value){
      var userFeature = type + '';
      user.browserProfile[userFeature] = value;
    },
    kill: function(){
      user.type = '';
      user.name = '';
      user.room = '';
      user.mediaType = '';
      user.karma = 0;
      user.browserProfile = {};
    },
    incrementKarma: function(){
      user.karma++;
      $http.post('/session', JSON.stringify(user));
    },
    decrementKarma: function(){
      user.karma--;
      $http.post('/session', JSON.stringify(user));
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
    },
    getTalkRequests: function(){
      var requests = [];
      _.each(room.talkRequests, function(value){
        requests.push(value);
      });
      return requests;
    },
    removeTalkRequest: function(name){
      delete room.talkRequests[name];
    },
    addTalkRequest: function(user){
      room.talkRequests[user.name] = user;
    },
    kill: function(){
      room.talkRequests = {};
      room.memberCount = 0;
      room.talker = '';
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
                Room.setTalkRequests(room.talkRequests);
                scope.talkRequests = Room.getTalkRequests();
                scope.talkRequests.sort(function(a,b){
                  if (a.karma > b.karma){return 1;}
                  else if (a.karma < b.karma){return -1;}
                  else {return 0;}
                });
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
          // window.confirm('You are the admin of a room, would you like to return to it?') ? $location.path('/admin') : socket.emit('broadcast:closeRoom', User.get());
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


