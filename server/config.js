'use strict';

exports = {};
module.exports = exports;

var express = require('express');
var path = require('path');
var rooms = require('./rooms.js');
var users = require('./users.js');
var act = require('./middleware.js');


exports.config = function(app){
  var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    // intercept OPTIONS method
    if ('OPTIONS' === req.method) {
      res.send(200);
    }
    else {
      next();
    }
  };

  app.configure(function(){
    app.use(allowCrossDomain);
    app.set( 'views', path.join( __dirname, './../client' ) );
    app.set( 'view engine', 'html' );
    app.set('port', process.env.PORT || 3000);
    app.use(express.bodyParser());
    app.use(express.favicon(path.join( __dirname, './../client/favicon.ico')));
    app.use( express.static( path.join( __dirname, './../client' ) ) );
    app.use(app.router);
    app.get('/rooms', act.getAllRooms(req, res); );
    app.get('/room/:room', act.getRoom(req, res); );
    app.get('/messages', act.getRoomMessages(req, res );
    app.get('/session', act.getUser(req, res);
    app.post('/session', act.setUser(req, res);
    app.post('/toggleQueue', act.toggleRoomQueue(req, res);
      rooms[req.body.room].isOpen = req.body.bool;
      res.send(200);
    });
    app.get('/testPost', function(req, res) {
      var location = '10.0.1.29';
      opentok.createSession(location, function(result) {
        sessionId = result;
        token = opentok.generateToken({session_id:sessionId});
        res.send(JSON.stringify({sessionId: sessionId, token: token}));
      });
    });
    // app.get('/', function (req, res) {
    //   res.sendFile(__dirname + './../client/index.html');
    // });
  });

  app.configure( 'development', function() {
      app.use( express.errorHandler({dumpExceptions: true, showStack: true }));
  });

  app.configure( 'production', function() {
      app.use(express.errorHandler());
  });

  var getCookieId = function(string){
    return string.slice(string.indexOf('=') + 1);
  };
};