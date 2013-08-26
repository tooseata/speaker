'use.strict';

angular.module('speakerApp')
  .controller('QuestionsCtrl', function ($scope, socket, User, Session) {
    $scope.user = User.get();
    Session.user($scope);
    Session.questions($scope);
    $scope.upVote = function(request){
      request.question.upvotes++;
      sortQuestions();
      socket.emit('question:upVote', {room: $scope.user.room, request: request});
    };
    $scope.downVote = function(request){
      request.question.upvotes--;
      sortQuestions();
      socket.emit('question:downVote', {room: $scope.user.room, request: request});
    };
    socket.on('question:upVoted', function(request){
      console.log('woo!', request);
      _.each($scope.questions, function(value){
        if (value.key === request.key){
          value.question.upvotes++;
        }
      });
      sortQuestions();
    });
    socket.on('question:downVoted', function(request){
      _.each($scope.questions, function(value){
        if (value.key === request.key){
          value.question.upvotes--;
        }
      });
      sortQuestions();
    });
    var sortQuestions = function(){
      $scope.questions.sort(function(a,b){
        if (a.question.upvotes > b.question.upvotes){
          return 1;
        } else if (a.question.upvotes < b.question.upvotes){
          return -1;
        } else {
          return 0;
        }
      });
    };
  });