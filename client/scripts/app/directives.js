'use.strict';
/*jshint multistr: true */

var app = angular.module('speakerApp');
app.directive('questions', function(){
  return {
    restrict: 'E',
    require: 'ng-controller',
    template: '<div class="hero-unit">\
                <div id="questions_list">\
                  <h3>Questions</h3>\
                  <div ng-repeat="request in questions">\
                    <div ng-click=vote(request) ng-class="{true: "upVoted", false: "downVoted"}[upVoted[request.key]]">\
                      <label>{{request.user.name}}</label><p>{{request.question.message}}</p><h6>{{request.question.upvotes}}</h6>\
                    </div>\
                  </div>\
                </div>\
                <form>\
                  <input type="text" ng-model="question" maxLength="100" placeholder="Questions?"></input>\
                  <a class="btn btn-small btn-success" ng-click="submitQuestion()">Submit</a>\
                </form>\
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
          console.log('Doing stuff', event);
          fn(scope, {$event: event});
        });
      });
    };
  }]);
});

