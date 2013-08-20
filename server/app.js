var express = require('express'),
  http = require('http'),
  path = require('path'),
  io = require('socket.io'),
  appConfig = require( './../app-config.json' );

  var app = express();


var rooms = {};

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
    socket.broadcast.to(data.user.room).emit('new:talkRequest', data.user);
  });
  socket.on('broadcast:cancelTalkRequest', function(data){
    socket.broadcast.to(data.user.room).emit('new:cancelTalkRequest', data.user);
  });
  socket.on('broadcast:joinRoom', function(data){
    if (data.user.type === 'admin'){
      rooms[data.user.room] = {admin: true};
    } else {
      rooms[data.user.room][data.user.name] = true;
    }
    socket.join(data.user.room);
    socket.broadcast.to(data.user.room).emit('new:joinRoom', data.user);
  });
  socket.on('broadcast:leaveRoom', function(data){
    if (data.user.type === 'admin'){
      delete rooms[data.user.room];
    } else {
      rooms[data.user.room] && delete rooms[data.user.room][data.user.name];
    }
    console.log(data.user);
    socket.leave(data.user.room);
    socket.broadcast.to(data.user.room).emit('new:leaveRoom', data.user);
  });
});


