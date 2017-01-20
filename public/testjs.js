var socket = io();

function display(string) {
	$('#messages').append($('<li>').text(string));
}

$('#chat').submit(function(){
    socket.emit('chat message', $('#m').val());
    $('#m').val('');
    return false;
});

socket.on('chat message', function(msg){
	display(msg);
});

socket.on('problem', function(msg) {
	display('Error: ' + msg.message);
});

socket.on('created', function(msg) {
    console.log(msg);
	display('Joining game room. GameID: ' + msg.gameID);
});

socket.on('joined', function(msg) {
	display('Joined game room: ' + msg.gameID);
	display('Players in room: ' + msg.playerIDs.toString());
});

socket.on('newplayer', function(msg) {
	display(msg.playerID + ' has joined the game room');
});

socket.on('playerleft', function(msg) {
	display(msg.playerID + ' has left the game room');
});

socket.on('started', function(msg) {
	display('The game has started!');
	display('Player order is: ' + msg.playerOrder.toString());
});

socket.on('turn', function(msg) {
	display('It is ' + msg.playerID + '\'s turn');
	display('Current card is ' + msg.card.toString() + ' with bid ' + msg.bid.toString());
});

socket.on('taken', function(msg) {
	display(msg.playerID + ' took ' + msg.card.toString() + ' and ' + msg.bid.toString() + ' moneys');
});

socket.on('passed', function(msg) {
	display(msg.playerID + ' passed ' + msg.card.toString());
});

socket.on('ended', function(msg) {
	display(msg.results);
});
