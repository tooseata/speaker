var express = require('express'),
  http = require('http'),
  path = require('path'),
  io = require('socket.io'),
  appConfig = require( './../app-config.json' );

  var app = express();

// Need to modularize. 
var rooms = {};
var sessions = {};
//

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

// Start server - hook in sockets instance
app.io = io.listen( http.createServer(app).listen( app.get('port'), function() {
    console.log( 'Express server listening on ' + app.get( 'port' ) );
}));

app.io.sockets.on('connection', function(socket){
  socket.on('broadcast:talkRequest', function(data){
    var user = data;
    var room = user.room;
    rooms[room].talkRequests[user.name] = user;
    socket.broadcast.to(room).emit('new:talkRequest', user);
    if (!rooms[room].isOpen){
      socket.join(user.name);
      socket.to(user.name).emit('new:queueIsClosed', user);
    }

  });
  socket.on('broadcast:cancelTalkRequest', function(data){
    var user = data;
    var room = user.room;
    delete rooms[room].talkRequests[user.name];
    socket.broadcast.to(room).emit('new:cancelTalkRequest', user);
  });

  socket.on('broadcast:joinRoom', function(data){
    var user = data;
    var room = user.room;
    if (user.type === 'admin'){
      rooms[room] = {
        members: {admin: true},
        talkRequests: {},
        isOpen: true
      };
    } else {
      rooms[room].members[user.name] = true;
      socket.broadcast.to(room).emit('new:joinRoom', user);
    }
    socket.join(room);
  });

  socket.on('broadcast:join', function(data){
    socket.join(data.room);
  });

  socket.on('broadcast:leaveRoom', function(data){
    var user = data;
    var room = user.room;
    if (user.type === 'admin'){
      delete rooms[room];
    } else {
      delete rooms[room].members[user.name];
    }
    socket.leave(room);
    socket.broadcast.to(room).emit('new:leaveRoom', user);
  });
});


