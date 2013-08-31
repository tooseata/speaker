/*jshint multistr: true */

var app = angular.module('speakerApp');
app.directive('questions', function(){
  'use.strict';
  return {
    restrict: 'E',
    require: 'ng-controller',
    template: '<div id="question_container">\
  <div id="questions_list">\
    <ul class="thumbnails">\
      <li class="span5 clearfix" ng-repeat="request in questions">\
        <div class="thumbnail clearfix">\
          <div class="caption" class="pull-left">\
            <a class="btn btn-primary icon  pull-right" ng-click=vote(request) ng-class="{true: "upVoted", false: "downVoted"}[upVoted[request.key]]"><span class="badge badge-success">{{request.question.upvotes}}</span></a>\
            <div class="pull-left">\
              <div class="span2 inliney"><h3 class="message_user_name">{{request.user.name}}:</h3></div>\
              <div class="span3 inliney"><p class="message_message">{{request.question.message}}</p></div>\
            </div>\
          </div>\
        </div>\
      </li>\
    </ul>\
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

