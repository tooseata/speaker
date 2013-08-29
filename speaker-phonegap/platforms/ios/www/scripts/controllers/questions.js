'use.strict';

angular.module('speakerApp')
  .controller('QuestionsCtrl', function ($scope, socket, User, Session) {
    $scope.user = User.get();
    $scope.questions = [];
    $scope.upVoted = {};
    Session.questions($scope);

    $scope.upVote = function (request) {
      request.question.upvotes++;
      sortQuestions();
      socket.emit('question:upVote', {
        room: $scope.user.room,
        request: request
      });
      $scope.upVoted[request.key] = true;
    };
    $scope.downVote = function (request) {
      request.question.upvotes--;
      sortQuestions();
      socket.emit('question:downVote', {
        room: $scope.user.room,
        request: request
      });
      $scope.upVoted[request.key] = false;
    };
    socket.on('question:upVoted', function (request) {
      _.each($scope.questions, function (value) {
        if (value.key === request.key) {
          value.question.upvotes++;
        }
      });
      sortQuestions();
    });
    socket.on('question:downVoted', function (request) {
      _.each($scope.questions, function (value) {
        $scope.upVoted[request.key] = false;
        console.log($scope.questions);
        if (value.key === request.key) {
          value.question.upvotes--;
        }
      });
      sortQuestions();
    });
    socket.on('question:update', function (request) {
      $scope.questions.push(request);
      $scope.upVoted[request.key] = false;
      sortQuestions();
      console.log($scope.upVoted);
    });
    var sortQuestions = function () {
      $scope.questions.sort(function (a, b) {
        if (a.question.upvotes > b.question.upvotes) {
          return -1;
        } else if (a.question.upvotes < b.question.upvotes) {
          return 1;
        } else {
          return 0;
        }
      });
    };
  });