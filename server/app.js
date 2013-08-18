var express = require('express'),
  http = require('http'),
  path = require('path'),
  io = require('socket.io'),
  appConfig = require( './../app-config.json' );

  var app = express();

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

// Start server - hook in sockets instance
app.io = io.listen( http.createServer(app).listen( app.get('port'), function() {
  console.log( 'Express server listening on ' + app.get( 'port' ) );
}));



