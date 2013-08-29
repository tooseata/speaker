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
            $http.get('http://127.0.0.1:3000/rooms').success(function(data){
                                        scope.existingRooms = data;
                                        }).error(function(err){
                                                 console.log(err);
                                                 console.log('error on room collection.');
                                                 });
//            $http({method: 'GET',
//                  url: 'http://127.0.0.1:3000/rooms'})
//                  .success(function(data){
//                    scope.existingRooms = data;
//                    console.log('success');
//                  }).
//                  error(function(err) {
//                    console.log(err);
//                    console.log('error was called');
//                  });
            },
            questions: function(scope){
            $http({method: 'GET', url: 'http://127.0.0.1:3000/messages'}).success(function(data){
                                           if (Object.keys(data).length){
                                           _.each(data, function(question, key){
                                                  scope.questions.push({key: key, question: question});
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
