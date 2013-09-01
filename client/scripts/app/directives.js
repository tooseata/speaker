/*jshint multistr: true */

var app = angular.module('speakerApp');
app.directive('questions', function(){
  'use.strict';
  return {
    restrict: 'E',
    require: 'ng-controller',
    template: '<div id="question_container">\
  <div id="questions_list">\
    <table class="questions-table table">\
      <tr class ="question" ng-repeat="request in questions">\
        <td class="user-name-cell">{{request.user.name}}</td>\
        <td class=>{{request.question.message}}</td>\
        <td class="upvote-cell">\
          <div>\
            <b>{{request.question.upvotes}}</b>\
            <a ng-show="upVoted[request.key]" ng-click="vote(request)"><img src="./../images/upvote.png"></a>\
            <a ng-show="!upVoted[request.key]" ng-click="vote(request)"><img src="./../images/downvote.png"></a>\
          </div>\
        </td>\
      </tr>\
    </table>\
  </div>\
  <form>\
    <input class="form-control" id="message_input"type="text" ng-model="question" maxLength="200" placeholder="Questions?"></input>\
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

