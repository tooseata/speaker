'use.strict';

angular.module('speakerApp')
  .controller('QuestionsCtrl', function ($window, $scope, socket, User, Session) {
    Session.user($scope);
    $scope.user = User.get();
    $scope.questions = [];
    $scope.upVoted = {};
    $scope.phone = $window.innerWidth < 520 ? 'first-element' : false;
    Session.questions($scope);
    console.log($scope.updateMessage);

    $scope.submitQuestion = function(){
      socket.emit('question:new', {question: $scope.question, user: $scope.user});
      $scope.question = '';
    };
    
    $scope.vote = function(request){
      if ($scope.upVoted[request.key]){
        console.log('downvoted');
        request.question.upvotes--;
        socket.emit('question:downVote', request);
        if (request.user.name === $scope.user.name){
          User.decrementKarma();
          $scope.user = User.get();
        }
        $scope.upVoted[request.key] = false;
      } else {
        console.log('upvoted');
        request.question.upvotes++;
        socket.emit('question:upVote', request);
        if (request.user.name === $scope.user.name){
          User.incrementKarma();
          $scope.user = User.get();
        }
        $scope.upVoted[request.key] = true;
      }
      console.log($scope.user);
      sortQuestions();
    }
    socket.on('question:upVoted', function(request){
      if (request.user.name === $scope.user.name){
        User.incrementKarma();
      }
      _.each($scope.questions, function(value){
        if (value.key === request.key){
          value.question.upvotes++;
        }
      });
      sortQuestions();
    });
    socket.on('question:downVoted', function(request){
      if (request.user.name === $scope.user.name){
        User.decrementKarma();
      }
      _.each($scope.questions, function(value){
        $scope.upVoted[request.key] = false;
        console.log($scope.questions);
        if (value.key === request.key){
          value.question.upvotes--;
        }
      });
      sortQuestions();
    });
    socket.on('question:update', function(request){
      $scope.questions.push(request);
      $scope.upVoted[request.key] = false;
      sortQuestions();
    });

    var sortQuestions = function(){
      $scope.questions.sort(function(a,b){
        if (a.question.upvotes > b.question.upvotes){
          return -1;
        } else if (a.question.upvotes < b.question.upvotes){
          return 1;
        } else {
          return 0;
        }
      });
    };
  });