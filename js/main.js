// This is where the main logic goes
'use strict';
var isChannelReady;
var isAdmin;
var isStarted;
var localStream;
var pc;
var remoteStream;
var turnReady;

// I don't fully understand what this config stuff does

var pc_config = webrtcDetectedBrowser === 'firefox' ?
  {'iceServers':[{'url':'stun:23.21.150.121'}]} : // number IP
  {'iceServers': [{'url': 'stun:stun.l.google.com:19302'}]};

var pc_constraints = {'optional': [{'DtlsSrtpKeyAgreement': true}]};

// Set up audio and video regardless of what devices are present.
var sdpConstraints = {'mandatory': {
  'OfferToReceiveAudio':true,
  'OfferToReceiveVideo':true }};

////////////////////////////////////

var room = location.pathname.substring(1);

if (room === '') {
  room = prompt('Enter room name: ');
}

var socket = io.connect();
if (room !== '') {
  console.log('Create or join room ', room);
  socket.emit('create or join', room);
}

socket.on('created', function(room) {
  console.log('Created room' + room);
  isAdmin = true;
});

socket.on('full', function(room) {
  console.log('Room ' + room + ' is full');
});

socket.on('join', function(room) {
  console.log('Another peer made a request to join room', room);
  console.log('This peer is the admin of room', room);
  isChannelReady = true;
});

socket.on('joined', function(room) {
  console.log('Another peer has joined the room', room);
  isChannelReady = true;
});

socket.on('log', function(array) {
  console.log.apply(console, array);
});


