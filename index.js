// Uses Express
var express = require('express');
var app = express();

// Uses Socket.IO
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Uses our game code
var nothanks = require('./game.js');

// Sets the port that we listen on. 
// process.env.PORT is defined by Heroku
port = process.env.PORT || 3000;

// Allows clients to get the js files in the public directory
app.use('/public', express.static(__dirname + '/public'));

// When clients make a GET request to our site, hit them with index.html
app.get('/', function(req, res){
    res.sendFile(__dirname + '/indextest.html');
});

// This will be a global directory of all the games currently being run
io.games = {};

// When a user connects, initialize their socket
io.on('connection', function(socket){
    console.log('A new user connected' + socket.id);

    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
    });

    socket.on('disconnect', function(){
        console.log('user disconnected');
    });

    // Initialize the game
    nothanks.initGame(io, socket);
});

// Start listening on our port
http.listen(port, function(){
    console.log('listening on *:' + port);
});
