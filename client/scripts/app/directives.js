app.directive('questions', function(){
  return {
    restrict: 'A',
    require: 'ng-controller',
    templateURL: '../views/questions.html'
  };
});