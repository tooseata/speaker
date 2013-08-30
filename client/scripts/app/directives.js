'use.strict';
/*jshint multistr: true */

var app = angular.module('speakerApp');
app.directive('questions', function(){
  return {
    restrict: 'E',
    require: 'ng-controller',
    template: '<div class="hero-unit">\
                <div style="questions_list">\
                  <h3>Questions</h3>\
                  <ul class="thumbnails">\
                    <li class="span5 clearfix" ng-repeat="request in questions">\
                      <div class="thumbnail clearfix">\
                        <div class="caption" class="pull-left">\
                          <a class="btn btn-primary icon  pull-right" ng-click=vote(request) ng-class="{true: "upVoted", false: "downVoted"}[upVoted[request.key]]">Vote <span class="badge badge-success">{{request.question.upvotes}}</span></a>\
                          <div class="pull-left">\
                            <p>Quetion: {{request.question.message}}</p>\
                            <p>Name: {{request.user.name}}</p>\
                          </div>\
                        </div>\
                      </div>\
                    </li>\
                  </ul>\
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

