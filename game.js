exports.initGame = function(sio, socket){
    io = sio;
    gameSocket = socket;

    // Lets the user know they've connected
    console.log('User connected: ' + gameSocket.id);
    gameSocket.emit('connected', {
        message: "Connected!",
    });

    // When the user creates a new gameroom
    gameSocket.on('create', function(msg){
        
    });

    // When the user joins a gameroom
    gameSocket.on('join', function(msg){
        
    });

    // When the user starts the game
    gameSocket.on('start', function(msg){

    });

    // When the user takes a card
    gameSocket.on('take', function(msg){

    });

    // When the user passes a card
    gameSocket.on('pass', function(msg){

    });

    // When the user restarts the game
    gameSocket.on('restart', function(msg){

    });

    gameSocket.on('disconnect', function(){
        console.log('User disconnected: ' + gameSocket.id);
    });
}

function createRoom() {
    // Pick a random code
    // Check that a game room doesn't already exist
    // Have the user join that room
}

function joinRoom(msg) {
    // Create the room if it exists
    // Join the game
}

function startGame(msg) {
    // Initialize a new game
}

function takeCard(msg) {

}

function passCard(msg) {

}

function restartGame(msg) {

}


