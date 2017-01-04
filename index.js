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
    console.log('a user connected');
});

http.listen(port, function(){
    console.log('listening on *:' + port);
});
