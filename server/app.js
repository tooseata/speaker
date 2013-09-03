'use strict';

var express = require('express'),
  http = require('http'),
  path = require('path'),
  io = require('socket.io'),
  OpenTok = require('../node_modules/opentok');

var keys = require('../keys.js');
var app = express();
var rooms = {};
var sessions = {};
var opentok = new OpenTok.OpenTokSDK(keys.key, keys.secret);

// handles CORS
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
  app.use(express.favicon(path.join( __dirname, './../client/favicon.ico')));
  app.use(allowCrossDomain);
  app.set( 'views', path.join( __dirname, './../client' ) );
  app.set( 'view engine', 'html' );
  app.set('port', process.env.PORT || 3000);
  app.use(express.bodyParser());
  app.use( express.static( path.join( __dirname, './../client' ) ) );
  app.use(app.router);
  app.use(function(err, req, res, next){
    if(!err) return next();
    console.error(err.stack);
    res.send('error!');
  });

  app.get('/rooms', function(req, res){
    res.send(rooms);
  });
  app.get('/room/:room', function(req, res){
    res.send(rooms[req.params.room]);
  });
  app.get('/messages', function(req,res){
    var cookieId = getCookieId(req.headers.cookie);
    if (sessions[cookieId]){
      res.send(rooms[sessions[cookieId].room].questions);
    } else {
      res.send(404);
    }
  });
  app.get('/session', function(req, res){
    if (!sessions[getCookieId(req.headers.cookie)]){
      sessions[getCookieId(req.headers.cookie)] = {type:'', name:'', room:'', mediaType:'', karma: 0, browserProfile: {}};
    }
    res.send(sessions[getCookieId(req.headers.cookie)]);
  });
  app.post('/session', function(req, res){
    sessions[getCookieId(req.headers.cookie)] = req.body;
    res.send(200);
  });
  app.post('/toggleQueue', function(req, res){
    rooms[req.body.room].isOpen = req.body.bool;
    res.send(200);
  });
});

app.configure( 'development', function() {
    app.use( express.errorHandler( { dumpExceptions: true, showStack: true } ) );
});

app.configure( 'production', function() {
    app.use( express.errorHandler() );
});

var getCookieId = function(string){
  // return string.slice(string.indexOf('=') + 1);
};


app.io = io.listen( http.createServer(app).listen( app.get('port'), function() {
    console.log( 'Express server listening on ' + app.get( 'port' ) );
}));

app.io.sockets.on('connection', function(socket){
  socket.on('message', function(message) {
    if (socket.store.data.userClient){
      if (room) {
        console.log('Message from Client to Admin');
        var clientRoomSource = socket.store.data.userClient.room;
        // Get socket ID of Admin for the room that the client belongs to
        var roomAdminSocketId = rooms[clientRoomSource].adminSocketId;
        // Route the message to the admin of the room
        app.io.sockets.sockets[roomAdminSocketId] && app.io.sockets.sockets[roomAdminSocketId].emit('message', message);
      }
    } else {
      if (socket.store.data.userAdmin) {
        var room = socket.store.data.userAdmin.room;
        var talker = rooms[room]['talker']
        var talkerSocketId = rooms[room]["socketIds"][talker];
        var adminRoomSource = socket.store.data.userAdmin.room;
        // Send the message to the correct client that made the request
        app.io.sockets.sockets[talkerSocketId] && app.io.sockets.sockets[talkerSocketId].emit('message', message);
      }
    }
  });

  socket.on('broadcast:talkRequest', function(data){
    var user = data;
    var room = user.room;
    if (!room) {
      return;
    }
    rooms[room].talkRequests[user.name] = user;
    rooms[room].talkRequests[user.id] = socket.id;
    if (rooms[room].isOpen){
      socket.broadcast.to(room).emit('new:talkRequest', user);
      socket.to(room).emit('new:clientIsChannelReady');
    } else {
      socket.join(user.name);
      socket.to(user.name).emit('new:queueIsClosed', user);
    }
  });

  socket.on('broadcast:cancelTalkRequest', function(data){
    var user = data;
    var room = user.room;
    if (room) {
      var roomAdminSocketId = rooms[room].adminSocketId;
      app.io.sockets.sockets[roomAdminSocketId] && app.io.sockets.sockets[roomAdminSocketId].emit('new:cancelTalkRequest', user.name);
      delete rooms[room].talkRequests[user.name];
      delete rooms[room].talkRequests[user.id];
    }
  });

  socket.on('broadcast:openTokStreaming', function(data) {
    var room = data.room;
    if (!room) {
      return;
    }
    var token = opentok.generateToken({session_id: data.sessionId});
    var socketId = rooms[room].adminSocketId;
    app.io.sockets.sockets[socketId] && app.io.sockets.sockets[socketId].emit('new:openTokStreaming', {apiKey: keys.key, sessionId: data.sessionId, token: token});
  });

  socket.on('broadcast:joinRoom', function(data){
    var user = data;
    var room = user.room;
    if (!room) {
      return;
    }
    var isMobile = user.isMobile;
    if (user.type === 'admin'){
      console.log('******* AN ADMIN HAS JOINED THE ROOM ********')
      socket.set("userAdmin", user, function(){
        rooms[room] = new Room(socket.id);
      });
    } else {
       socket.set("userClient", user, function(){
        rooms[room].members[user.name] = true;
        rooms[room]["socketIds"][user.name] = socket.id;
        rooms[room].isMobile[user.name] = isMobile;
        socket.broadcast.to(room).emit('new:joinRoom');
      });
    }
    socket.join(room);
  });

  socket.on('broadcast:join', function(data){
    socket.join(data.room);
  });

  // Talker selected by admin
  socket.on('broadcast:setTalker', function(data) {
    var room = data.roomName;
    if (!room) {
      return;
    }
    rooms[room]["talker"] = data.talker;

    // Tell other clients a talker has been chosen
    socket.broadcast.to(room).emit('new:talkerChosen', data.talker);

    // Open an OpenTok or WebRTC connection, depending on whether or not the user isMobile
    var isMobile = rooms[room]["isMobile"][data.talker];
    var talkerSocketId = rooms[room]["socketIds"][data.talker];
    var adminSocketId = rooms[room].adminSocketId;
    if (isMobile) {
      opentok.createSession('192.241.231.123', function(result) {
        var token = opentok.generateToken({session_id:result});
        var roomAdminSocketId = rooms[room].adminSocketId;
        app.io.sockets.sockets[talkerSocketId] && app.io.sockets.sockets[talkerSocketId].emit('new:beginOpenTokStream', {apiKey: keys.key, sessionId: result, token: token});
      });
    } else {
      app.io.sockets.sockets[adminSocketId] && app.io.sockets.sockets[adminSocketId].emit('new:beginWebRTC');
    }
  });

  socket.on('question:upVote', function(data){
    var room = data.user.room;
    if (!room) {
      return;
    }
    rooms[room].questions[data.key].question.upvotes++;
    socket.broadcast.to(room).emit('question:upVoted', data);
  });

  socket.on('question:downVote', function(data){
    var room = data.user.room;
    if (!room) {
      return;
    }
    rooms[room].questions[data.key].question.upvotes--;
    socket.broadcast.to(room).emit('question:downVoted', data);
  });

  socket.on('broadcast:leave', function(data){
    socket.leave(data.room);
  });

  socket.on('broadcast:closeRoom', function(data){
    var user = data;
    var room = user.room;
    if (!room) {
      return;
    }
    delete rooms[room];
    socket.broadcast.to(room).emit('new:closeRoom');
    socket.leave(room);
  });

  socket.on('new:adminStreamAttached', function(room) {
    var talker = rooms[room]["talker"];
    var talkerSocketId = rooms[room]["socketIds"][talker];
    app.io.sockets.sockets[talkerSocketId] && app.io.sockets.sockets[talkerSocketId].emit('broadcast:adminStreamAttached', talker);
  });

  socket.on('question:new', function(data){
    var user = data.user;
    var room = user.room;
    if (!room) {
      return;
    }
    var socketId = rooms[room]["socketIds"][user.name];
    app.io.sockets.sockets[socketId] && app.io.sockets.sockets[socketId].emit('new:questionSubmitted');
    var question = new Question(data.question);
    var key = randomKey();
    rooms[room].questions[key] = {key: key, question: question, user: user};
    socket.to(room).emit('question:update', rooms[room].questions[key]);
    socket.broadcast.to(room).emit('question:update', rooms[room].questions[key]);
  });

  // Do we need this?
  socket.on('broadcast:establishClientConnection', function() {
    socket.broadcast.emit('new:establishClientConnection');
  });

  socket.on('broadcast:microphoneClickedOnClientSide', function(data) {
    var user = data;
    var room = user.room;
    if (!room) {
      return;
    }
    socket.broadcast.to(room).emit('new:microphoneClickedOnClientSide', user.name);
  });

  socket.on('broadcast:closeRequest', function(data) {
    data && function() {
      var user = data.talker;
      var roomName = data.room;
      var clientId = rooms[roomName].socketIds[user];
      console.log('clientId', clientId);
      app.io.sockets.sockets[clientId] && app.io.sockets.sockets[clientId].emit('new:closeRequest');
    }();
  });

  socket.on('broadcast:leaveRoom', function(data){
    var user = data;
    var room = user.room;
    if (!room) {
      return;
    }
    if (user.type === 'admin'){
      delete rooms[room];
    } else {
      if (rooms[room]){
        delete rooms[room].members[user.name];
      }
    }
    socket.leave(room);
    socket.broadcast.to(room).emit('new:leaveRoom', user);
    console.log('someone just left the room!');
  });
});

var Room = function(socketId){
  this.members = {};
  this.questions = {};
  this.talkRequests = {};
  this.isOpen = true;
  this.adminSocketId = socketId;
  this.socketIds = {};
  this.karma = {};
  this.isMobile = {};
};

var Question = function(message){
  this.upvotes = 0;
  this.message = message;
};
var randomKey = function(){
  return Math.floor(Math.random() * 1000000000).toString();
};
// module.exports = app;
