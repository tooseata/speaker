'use strict';

var express = require('express'),
  http = require('http'),
  path = require('path'),
  io = require('socket.io'),
  OpenTok = require('../node_modules/opentok');

var app = express();
var rooms = {};
var sessions = {};

var key = '39238222';
var secret = '9398fdcde52632420695daf73895fe7c0e55153c';
var opentok = new OpenTok.OpenTokSDK(key, secret);

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
    if (sessions[getCookieId(req.headers.cookie)]){
      res.send(sessions[getCookieId(req.headers.cookie)]);
    } else {
      sessions[getCookieId(req.headers.cookie)] = {type:'', name:'', room:''};
      res.send({type:'', name:'', room:''});
    }
  });
  app.post('/session', function(req, res){
    sessions[getCookieId(req.headers.cookie)] = req.body;
    res.send(200);
  });
  app.post('/toggleQueue', function(req, res){
    rooms[req.body.room].isOpen = req.body.bool;
    res.send(200);
  });
  app.get('/opentok/:room', function(req, res) {
    var room = req.params.room;
    var sessionId = rooms[room].sessionId;
    var token = opentok.generateToken({session_id:sessionId});
    res.send(JSON.stringify({sessionId: sessionId, token: token}));
  });
  // app.get('/', function (req, res) {
  //   res.sendFile(__dirname + './../client/index.html');
  // });
});

app.configure( 'development', function() {
    app.use( express.errorHandler( { dumpExceptions: true, showStack: true } ) );
} );

app.configure( 'production', function() {
    app.use( express.errorHandler() );
} );

var getCookieId = function(string){
  // return string.slice(string.indexOf('=') + 1);
};


app.io = io.listen( http.createServer(app).listen( app.get('port'), function() {
    console.log( 'Express server listening on ' + app.get( 'port' ) );
}));

app.io.sockets.on('connection', function(socket){

  socket.on('message', function(message) {
    try{
      if (socket.store.data.userClient){
        console.log('Message from Client to Admin');
        var clientRoomSource = socket.store.data.userClient.room;
        // Get socket ID of Admin for the room that the client belongs to
        var roomAdminSocketId = rooms[clientRoomSource].adminSocketId;
        // Route the message to the admin of the room
        app.io.sockets.sockets[roomAdminSocketId].emit('message', message);
      } else {
        try {
          var room = socket.store.data.userAdmin.room;
          var talker = rooms[room]['talker']
          var talkerSocketId = rooms[room]["socketIds"][talker];
          var adminRoomSource = socket.store.data.userAdmin.room;
          // Send the message to the correct client that made the request 
          app.io.sockets.sockets[talkerSocketId].emit('message', message);
        } catch(e){
            console.log("message", e);
        }
      }
    } catch (e){
        console.log("message", e);
    }
  });
  
  socket.on('broadcast:talkRequest', function(data){
    try{
      var user = data;
      var room = user.room;
      rooms[room].talkRequests[user.name] = user;
      rooms[room].talkRequests[user.id] = socket.id;
      if (rooms[room].isOpen){
        socket.broadcast.to(room).emit('new:talkRequest', user);
        socket.to(room).emit('new:clientIsChannelReady');
      } else {
        socket.join(user.name);
        socket.to(user.name).emit('new:queueIsClosed', user);
      }
    } catch(e){
      console.log("broadcast:talkRequest", e);
    }

  });

  socket.on('broadcast:cancelTalkRequest', function(data){
    try{
      var user = data;
      var room = user.room;
      var roomAdminSocketId = rooms[room].adminSocketId;
      app.io.sockets.sockets[roomAdminSocketId].emit('new:cancelTalkRequest');
      delete rooms[room].talkRequests[user.name];
      delete rooms[room].talkRequests[user.id];
    } catch(e){
      console.log("broadcast:cancelTalkRequest", e);
    }
  });

  socket.on('broadcast:joinRoom', function(data){
    var user = data;
    var room = user.room;
    if (user.type === 'admin'){
      socket.set("userAdmin", user, function(){
        rooms[room] = new Room(socket.id);
        opentok.createSession('10.0.1.29', function(result) {
          var token = opentok.generateToken({session_id:result});
          rooms[room].sessionId = result;
          var roomAdminSocketId = rooms[room].adminSocketId;
          app.io.sockets.sockets[roomAdminSocketId].emit('new:adminOpentokInfo', {sessionId: result, token: token});
        });
      });
    } else {
       socket.set("userClient", user, function(){
        rooms[room].members[user.name] = true;
        rooms[room]["socketIds"][user.name] = socket.id;
        socket.broadcast.to(room).emit('new:joinRoom');
      });
    }
    socket.join(room);
  });

  socket.on('broadcast:join', function(data){
    socket.join(data.room);
  });

  socket.on('broadcast:setTalker', function(data) {
    var room = data.roomName;
    rooms[room]["talker"] = data.talker;
  });

  socket.on('question:upVote', function(data){
    var room = data.user.room;
    rooms[room].questions[data.key].question.upvotes++;
    rooms[room].karma[data.user.name]++;
    socket.broadcast.to(room).emit('question:upVoted', data);
  });

  socket.on('question:downVote', function(data){
    var room = data.user.room;
    rooms[room].questions[data.key].question.upvotes--;
    rooms[room].karma[data.user.name]++;
    socket.broadcast.to(room).emit('question:downVoted', data);
  });

  socket.on('broadcast:leave', function(data){
    socket.leave(data.room);
  });

  socket.on('broadcast:closeRoom', function(data){
    var user = data;
    var room = user.room;
    delete rooms[room];
    socket.broadcast.to(room).emit('new:closeRoom');
    socket.leave(room);
  });
  socket.on('question:new', function(data){
    var user = data.user;
    var room = user.room;
    var question = new Question(data.question);
    var key = randomKey();
    rooms[room].karma[user.name] = rooms[room].karma[user.name] || 0;
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
    socket.broadcast.to(room).emit('new:microphoneClickedOnClientSide', user.name);
  });

  socket.on('broadcast:closeRequest', function(data) {
    try{
      var user = data.talker;
      console.log('user', user);
      var roomName = data.room;
      console.log('roomName', roomName);
      var clientId = rooms[roomName].talkRequests[user.id]
      console.log('clientId', clientId);
      app.io.sockets.sockets[clientId].emit('new:closeRequest');
    } catch(e){
      console.log("broadcast:closeRequest", e);
    }
  });

  socket.on('broadcast:leaveRoom', function(data){
    var user = data;
    var room = user.room;
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
  this.sessionId = '';
  this.karma = {};
};

var Question = function(message){
  this.upvotes = 0;
  this.message = message;
};
var randomKey = function(){
  return Math.floor(Math.random() * 1000000000).toString();
};
// module.exports = app;
