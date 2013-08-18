var express = require('express'),
  http = require('http'),
  path = require('path'),
  io = require('socket.io'),
  appConfig = require( './../app-config.json' );

  var app = express();
  var server = http.createServer(app);
  var io = require('socket.io').listen(server);

// require('./config/middleware.js')(app);

var config = module.exports = {};
config.server = {'distFolder': path.resolve(__dirname, '../dist')};
config.server = {'staticUrl': __dirname +'/static'};

app.configure(function(){
  app.set( 'views', path.join( __dirname, './../app' ) );
  app.set( 'view engine', 'html' );
  app.set('port', process.env.PORT || 3000);
  app.use(express.bodyParser());
  app.use(express.favicon(path.join( __dirname, './../app/favicon.ico')));
  app.use( express.static( path.join( __dirname, './../app' ) ) );
  app.use(app.router);

});

app.configure( 'development', function() {
    app.use( express.errorHandler( { dumpExceptions: true, showStack: true } ) );
});

app.configure( 'production', function() {
    app.use( express.errorHandler() );
});

// require( './sockets/roomConnection.js');


io.sockets.on('connection', function (socket) {
    var log = function(/* arguments */) {
      var array = ['>>> '];
      for (var i = 0; i < arguments.length; i++) {
        array.push(arguments[i]);
      }
      socket.emit('log', array);
    };

    socket.on('message', function(message) {
      log('Got message: ', message);
      socket.broadcast.emit('message', message); // this should only be the room
    });

    socket.on('create or join', function (room) {
      var numClients = io.sockets.clients(room).length;
      log('Room ', + room + ' has ' + numClients + ' client(s)');
      log('Request to create or join room', room);

      if (numClients === 0) {
        socket.join(room);
        socket.emit('created', room);
      } else if (numClients === 1) {
        io.sockets.in(room).emit('join', room);
        socket.join(room);
        socket.emit('joined', room);
      } else { // currently has a maximum of two clients
        socket.emit('full', room);
      }

      socket.emit('emit(): client ' + socket.id + ' joined room ' + room);
      socket.broadcast.emit('broadcast(): client ' + socket.id + ' joined room ' + room);
    });
  });

// // Start server - hook in sockets instance
// app.io = io.listen( http.createServer(app).listen( app.get('port'), function() {
//   console.log( 'Express server listening on ' + app.get( 'port' ) );
// }));


server.listen(3000);

