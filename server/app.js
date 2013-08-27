var express = require('express'),
  http = require('http'),
  path = require('path'),
  io = require('socket.io'),
  appConfig = require( './../app-config.json' );

var app = express();
var rooms = {};
var sessions = {};

app.configure(function(){
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
});

app.configure( 'development', function() {
    app.use( express.errorHandler( { dumpExceptions: true, showStack: true } ) );
} );

app.configure( 'production', function() {
    app.use( express.errorHandler() );
} );

var getCookieId = function(string){
  return string.slice(string.indexOf('=') + 1);
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
    console.log(data, rooms);
    var user = data;
    var room = user.room;
    if (user.type === 'admin'){
      console.log('SET SOCKET WITH ADMIN USER INFO', user);
      socket.set("userAdmin", user, function(){
        rooms[room] = {
          members: {},
          talkRequests: {},
          isOpen: true,
          socketIds: {},
          adminSocketId: socket.id
        }; 
      });
    } else {
      console.log('SET SOCKET WITH CLIENT USER INFO', user);
      socket.set("userClient", user, function(){
        rooms[room].members[user.name] = true;
        rooms[room]["socketIds"][user.name] = socket.id;
        socket.broadcast.to(room).emit('new:joinRoom', user);
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

  socket.on('broadcast:microphoneClickedOnClientSide', function(data) {
    var user = data;
    var room = user.room;
    socket.broadcast.to(room).emit('new:microphoneClickedOnClientSide', user.name);
  });

  socket.on('broadcast:closeRequest', function(data) {
    try{
      var user = data.talker;
      var roomName = data.room;
      var clientId = rooms[roomName].talkRequests[user.id]
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
  });
});

// module.exports = app;
