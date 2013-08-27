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
  return string.slice(string.indexOf('=') + 1);
};

// Start server - hook in sockets instance
app.io = io.listen( http.createServer(app).listen( app.get('port'), function() {
    console.log( 'Express server listening on ' + app.get( 'port' ) );
}));

app.io.sockets.on('connection', function(socket){
  
  socket.on('broadcast:talkRequest', function(data){
    var user = data;
    var room = user.room;
    rooms[room].talkRequests[user.name] = user;
    if (rooms[room].isOpen){
      socket.broadcast.to(room).emit('new:talkRequest', user);
      socket.to(room).emit('new:clientIsChannelReady');
    } else {
      socket.join(user.name);
      socket.to(user.name).emit('new:queueIsClosed', user);
    }
  });

  socket.on('broadcast:cancelTalkRequest', function(data){
    try{
      var user = data;
      var room = user.room;
      delete rooms[room].talkRequests[user.name];
      socket.broadcast.to(room).emit('new:cancelTalkRequest', user);
    } catch(err){
      console.log(err);
    }
  });

  socket.on('broadcast:joinRoom', function(data){
    console.log(data, rooms);
    var user = data;
    var room = user.room;
    if (user.type === 'admin'){
      rooms[room] = new Room();
    } else {
      rooms[room].members[user.name] = true;
      socket.broadcast.to(room).emit('new:joinRoom', user);
    }
    socket.join(room);
  });

  socket.on('broadcast:join', function(data){
    socket.join(data.room);
  });

  socket.on('broadcast:leave', function(data){
    socket.leave(data.room);
  });

  socket.on('message', function(message) {
    socket.broadcast.emit('message', message);
  });

  socket.on('question:upVote', function(data){
    var room = data.room;
    var request = data.request;
    socket.broadcast.to(room).emit('question:upVoted', request);
  });

  socket.on('question:downVote', function(data){
    var room = data.room;
    var request = data.request;
    socket.broadcast.to(room).emit('question:downVoted', request);
  });

  socket.on('broadcast:closeRoom', function(data){
    var user = data;
    var room = user.room;
    delete rooms[room];
    socket.broadcast.to(room).emit('new:closeRoom');
    socket.leave(room);
  });
  socket.on('question:new', function(data){
    console.log(data);
    var user = data.user;
    var room = user.room;
    var question = new Question(data.question);
    var key = randomKey();
    rooms[room].questions[key] = question;
    socket.to(room).emit('question:update', {key: key, question: question});
    socket.broadcast.to(room).emit('question:update', {key: key, question: question});
  });
  socket.on('broadcast:microphoneClickedOnClientSide', function() {
    socket.broadcast.emit('new:microphoneClickedOnClientSide');
  });

  socket.on('broadcast:establishClientConnection', function() {
    socket.broadcast.emit('new:establishClientConnection');
  });

  socket.on('broadcast:closeRequest', function() {
    socket.broadcast.emit('new:closeRequest');
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

var Room = function(){
  this.members = {};
  this.questions = {};
  this.talkRequests = {};
  this.isOpen = true;
};
var Question = function(message){
  this.upvotes = 0;
  this.message = message;
};
var randomKey = function(){
  return Math.floor(Math.random() * 1000000000).toString();
};
// module.exports = app;
