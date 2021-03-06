/*jshint multistr: true */

var app = angular.module('speakerApp');
app.directive('questions', function(){
  'use.strict';
  return {
    restrict: 'E',
    require: 'ng-controller',
    template: '<div class="question-container">\
  <div class="questions-list">\
    <div class="question" ng-repeat="request in questions">\
      <span class="question-name" ng-show="!phone">{{request.user.name}}</span>\
      <span class="question-message">{{request.question.message}}</span>\
      <span class="up-vote-button">\
        <a ng-show="upVoted[request.key]" ng-click="vote(request)"><img src="./../images/upvote.png"></a>\
        <a ng-show="!upVoted[request.key]" ng-click="vote(request)"><img src="./../images/downvote.png"></a>\
      </span>\
      <span class="question-karma">{{request.question.upvotes}}</span>\
    </div>\
  </div>\
  <form>\
    <div class="question-field"><input class="question-field-input"type="text" ng-model="question" maxLength="70" placeholder="Questions?"></input></div>\
    <button id="message_submit" ng-click="submitQuestion()">Submit</button>\
  </form>\
</div>'


  };
});

angular.forEach('hmTap:tap hmDoubletap:doubletap hmHold:hold hmTransformstart:transformstart hmTransform:transform hmTransforend:transformend hmDragstart:dragstart hmDrag:drag hmDragend:dragend hmSwipe:swipe hmRelease:release'.split(' '), function(name) {
  var directive = name.split(':');
  var directiveName = directive[0];
  var eventName = directive[1];
  app.directive(directiveName,
  ['$parse', function($parse) {
    'use.strict';
    return function(scope, element, attr) {
      var fn = $parse(attr[directiveName]);
      var opts = $parse(attr[directiveName + 'Opts'])(scope, {});
      element.hammer(opts).bind(eventName, function(event) {
        scope.$apply(function() {
          console.log('Doing stuff', event);
          fn(scope, {$event: event});
        });
      });
    };
  }]);
});

