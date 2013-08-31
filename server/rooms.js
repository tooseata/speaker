'use strict';

var exports = {};
module.exports = exports;

var rooms = {};

exports.getAll = function(){
  return rooms;
};
exports.get = function(roomName){
  return rooms[roomName];
};