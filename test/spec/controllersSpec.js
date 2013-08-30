'use strict';

describe('Controllers', function () {
  var $scope,
      ctrl;

  beforeEach(module('speakerApp'));
  beforeEach(function () {
    this.addMatchers({
      toEqualData: function (expected) {
        return angular.equals(this.actual, expected);
      }
    });
  });

  describe('MainCtrl', function () {
    it('should do stuff to things', function () {
      expect(true).toBe(true);
    });
  });


// this

});