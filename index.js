var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

port = process.env.PORT || 3000;

app.use('/public', express.static(__dirname + '/public'));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    console.log('A new user connected');
    console.log(socket.id);

    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
    });
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
});

http.listen(port, function(){
    console.log('listening on *:' + port);
});
