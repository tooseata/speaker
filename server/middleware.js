'use strict';

var exports = {};
module.exports = exports;

var rooms = require('./rooms.js');
var users = require('./users.js');

exports.getAllRooms = function(req, res){
  res.send(rooms.getAll());
};
exports.getRoom = function(req, res){
  res.send(rooms.get(req.params.room));
};
exports.getRoomMessages = function(req, res){
  var uId = getCookieId(req.headers.cookie);
  var user = users.get(uId);
  var room = rooms.get(user.room);
  res.send(room.messages);
};
exports.getUser = function(req, res){
  var uId = getCookieId(req.headers.cookie);
  if (!users.hasUser(uId)){
    users.setNew(uId);
  }
  res.send(users.get(uId));
};
exports.setUser = function(req, res){
  var uId = getCookieId(req.headers.cookie);
  if (!users.hasUser(uId)){
    users.setNew(uId);
    users.setData(req.body);
    req.send(304);
  } else {
    users.setData(req.body);
    res.send(200);
  }
};


var getCookieId = function(string){
  return string.slice(string.indexOf('=') + 1);
};