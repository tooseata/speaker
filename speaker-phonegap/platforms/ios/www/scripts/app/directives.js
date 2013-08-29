'use.strict';
/*jshint multistr: true */

var app = angular.module('speakerApp');
app.directive('questions', function () {
  return {
    restrict: 'E',
    require: 'ng-controller',
    template: '<div id="questions_list">\
              <h3>Questions</h3>\
              <div ng-repeat="request in questions">\
              <p>{{request.question.message}}</p>\
              <div ng-switch on="upVoted[request.key]">\
              <button class="upVote_button" ng-switch-when="false" ng-click="upVote(request)"></button>\
              <button class="downVote_button" ng-switch-when="true" ng-click="downVote(request)"></button>\
              </div>\
              </div>\
              </div>'
  };
});