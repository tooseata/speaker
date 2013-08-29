'use strict';

describe('Controllers', function () {
  var $scope, ctrl;
  beforeEach(module('speakerApp'));
  beforeEach(function () {
    this.addMatchers({
      toEqualData: function (expected) {
        return angular.equals(this.actual, expected);
      }
    });
  });

  it('should attach a list of awesomeThings to the scope', function () {
    expect(true).toBe(true);
  });

// this

});