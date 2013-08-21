var express = require('express'),
  http = require('http'),
  path = require('path'),
  io = require('socket.io'),
  appConfig = require( './../app-config.json' );

  var app = express();


var rooms = {};
var sessions = {};
var getCookieId = function(string){
  return string.slice(string.indexOf('=') + 1);
};

var config = module.exports = {};
config.server = {'distFolder': path.resolve(__dirname, '../dist')};
config.server = {'staticUrl': __dirname +'/static'};

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
    res.send(sessions[getCookieId(req.headers.cookie)]);
  });
  app.post('/session', function(req, res){
    sessions[getCookieId(req.headers.cookie)] = req.body;
    res.send(200);
  });
});

app.configure( 'development', function() {
    app.use( express.errorHandler( { dumpExceptions: true, showStack: true } ) );
} );

app.configure( 'production', function() {
    app.use( express.errorHandler() );
} );

// Start server - hook in sockets instance
app.io = io.listen( http.createServer(app).listen( app.get('port'), function() {
    console.log( 'Express server listening on ' + app.get( 'port' ) );
}));

app.io.sockets.on('connection', function(socket){
  socket.on('broadcast:talkRequest', function(data){
    var room = data.user.room;
    var user = data.user;
    rooms[room].talkRequests[user.name] = user;
    socket.broadcast.to(room).emit('new:talkRequest', user);
  });
  socket.on('broadcast:cancelTalkRequest', function(data){
    var room = data.user.room;
    var user = data.user;
    delete rooms[room].talkRequests[user.name];
    socket.broadcast.to(room).emit('new:cancelTalkRequest', user);
  });

  socket.on('broadcast:joinRoom', function(data){
    console.log(data, 'data from admin');
    var room = data.user.room;
    var user = data.user; 
    if (user.type === 'admin'){
      if (!rooms[user.room]){
        rooms[room] = {
          members: {admin: true},
          talkRequests: {}
        };
      }
    } else {
      rooms[room].members[user.name] = true;
      socket.broadcast.to(room).emit('new:joinRoom', user);
    }
    socket.join(room);
  });

  socket.on('broadcast:leaveRoom', function(data){
    var room = data.user.room;
    var user = data.user;
    if (user.type === 'admin'){
      delete rooms[room];
    } else if (rooms[room]) {
      delete rooms[room].members[user.name];
    }
    socket.leave(room);
    socket.broadcast.to(room).emit('new:leaveRoom', user);
  });

  socket.on('message', function(message) {
    socket.broadcast.emit('message', message);
  });

  socket.on('clientIsChannelReady', function(){
    socket.broadcast.emit('clientIsChannelReady-client');
  });
  socket.on('broadcast:establishClientConnection', function() {
    console.log('trigger for establishClientConnection received on server side');
    socket.broadcast.emit('new:establishClientConnection');
  });
  socket.on('broadcast:checkQueueStatus', function(data) {
    console.log('User is checking the status of the queue');
    socket.broadcast.emit('new:checkQueueStatus', data.user.room);
  });
  socket.on('broadcast:queueIsOpen', function() {
    console.log('Server telling client queue is open');
    socket.broadcast.emit('new:queueIsOpen');
  });
  socket.on('broadcast:queueIsClosed', function() {
    console.log('Server telling client queue is closed');
    socket.broadcast.emit('new:queueIsClosed');
  });
  socket.on('broadcast:microphoneClickedOnClientSide', function() {
    console.log('server received notification from client that microphone is allowed');
    socket.broadcast.emit('new:microphoneClickedOnClientSide');
  });
});


