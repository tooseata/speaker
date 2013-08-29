'use.strict';
/*jshint multistr: true */

var app = angular.module('speakerApp');
app.directive('questions', function(){
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

angular.forEach('hmTap:tap hmDoubletap:doubletap hmHold:hold hmTransformstart:transformstart hmTransform:transform hmTransforend:transformend hmDragstart:dragstart hmDrag:drag hmDragend:dragend hmSwipe:swipe hmRelease:release'.split(' '), function(name) {
  var directive = name.split(':');
  var directiveName = directive[0];
  var eventName = directive[1];
  angular.module('speakerApp').directive(directiveName, 
  ['$parse', function($parse) {
    return function(scope, element, attr) {
      var fn = $parse(attr[directiveName]);
      var opts = $parse(attr[directiveName + 'Opts'])(scope, {});
      element.hammer(opts).bind(eventName, function(event) {
        scope.$apply(function() {
          console.log("Doing stuff", event);
          fn(scope, {$event: event});
        });
      });
    };
  }]);
});