/**
 * io is the global io structure
 *     io.games is an associative array indexed by gameID
 *     Each entry is an associative array {
 *         gameID : string
 *         playerIDs : string array
 *         inProgress : bool
 *         game = {
 *             playerOrder : string array
 *             currentDeck : int array
 *             cardsThrownOut : int array
 *             currentCard : int
 *             currentBid : int
 *             currentTurn : int
 *             foreach player in playerIDs = {
 *                 hand : int array
 *                 coins : int
 *             }
 *         }
 *     }
 */

/**
 * gameSocket is the player's socket
 *     gameSocket.id is the string of the player's ID
 *     gameSocket.gameID is assigned when a player enters a game room
 */

/**
 * Players may:
 *     Connect : 'connect'
 *     Create a room : 'create'
 *     Join a room : 'join', msg.gameID
 *     Start a game : 'start'
 *         Pass : 'pass'
 *         Pick up a card : 'take'
 *     End a game : 'end'
 *     Leave a room : 'leave'
 */

/**
 * The server responds:
 *     Problem : 'problem'
 *     Connected : 'connected'
 *     Joined : 'joined', msg.gameID, msg.playerIDs
 *         Someone else joins the room : 'newplayer', msg.playerID
 *         Someone leaves the room : 'playerleft', msg.playerID
 *     Started : 'started', msg.playerOrder
 *     Player's turn : 'turn', msg.playerID, msg.card, msg.bid
 *     Card taken : 'taken', msg.playerID, msg.card, msg.bid
 *     Card passed : 'passed', msg.playerID, msg.card, msg.bid
 *     Your hand and coins : 'yourhand', msg.hand, msg.coins
 *     Game ended : 'ended', msg.outcome = {
 *         playerID = {hand, coins, score}
 *     }
 *     Exited : 'exited'
 */ 

exports.initGame = function(io, gameSocket) {
    // Client error problem reporting
    // Reports an error back to the client
    // The client has sent back an invalid option
    function problem(errorMessage) {
        gameSocket.emit('problem', {message : errorMessage});
    }

    // createRoom is called when the player tries to create 
	// a new game room. Generate a random code and return it back to the user
	function createRoom(msg) {
		console.log('User ' + gameSocket.id + ' is trying to create a game');
		
		// Throws an error if
			// User is already in a game
		if (gameSocket.gameID) {
			problem('Already in game, gameID: ' + gameSocket.gameID);
			return;
		}

		// Pick a random string code that is not currently being used
		var gameID = ((Math.random() * 100000) | 0).toString();
		while (io.games[gameID]) {
			gameID = ((Math.random() * 100000) | 0).toString();
		}

		// Create the room and attach it to our shared data structure
		io.games[gameID] = {
			gameID : gameID,
			// TODO: password : false,
			playerIDs : [gameSocket.id],
			inProgress : false,
		};
		// Set the user to be in a game room
		gameSocket.gameID = gameID;
		// Join the room set up by SocketIO
		gameSocket.join(gameID);
		// Let the player know the gameroom code
		gameSocket.emit('joined', {
			gameID : gameID,
			playerIDs : io.games[gameID].playerIDs
		});
	}
	// Set the callback
    gameSocket.on('create', createRoom);

    // joinRoom is called when a user tries to join a room that has
	// already been created.
	function joinRoom(msg) {	
		// User should not be able to join the game room if
		    // The user has not given us a gameID
			// The gameID doesn't exist
			// The user is currently in a different game
			// The game has already started
			// We've hit a maximum limit to the game size (say 5?)
		if ((!msg) || (!msg.gameID)) {
			problem('No gameID specified');
			return;
		}
		console.log('User ' + gameSocket.id + ' trying to join ' + msg.gameID);
		
		gameID = msg.gameID;
		if (!io.games[gameID]) {
			problem(gameID + ' does not match a gameID in session. Create a new game to start a new one'); 
			return;
		}
		if (gameSocket.gameID) {
			problem('Already in game, gameID: ' + gameSocket.gameID);
			return;
		}
		if (io.games[gameID].inProgress) {
			problem('Game has already started');
			return;
		}

		// Add them into the shared game struct
		io.games[gameID].playerIDs.push(gameSocket.id);
		// Set them to be in the game
		gameSocket.gameID = gameID;
		// Let all the users in the room know
		io.sockets.in(gameID).emit('newplayer', {playerID : gameSocket.id});
		// Add them to SocketIO room
		gameSocket.join(gameID);
		// Let that user know that they joined
		gameSocket.emit('joined', {gameID : gameID, playerIDs : io.games[gameID].playerIDs})
	}
    gameSocket.on('join', joinRoom);

    // startGame is called when the user tries the game they are in
	function startGame(msg) {
		console.log('User ' + gameSocket.id + ' trying to start game');
		// Figure out which game room the socket is currently in
		gameID = gameSocket.gameID;
		// Throw error if
			// User is not in a game
			// The game has already been started
		if (!gameID) {
			problem('Not currently in a game. Create a new game to play');
			return;
		}
		if (!io.games[gameID]) {
			// Server side error!
			problem('Server is exploding');
			console.log('Horrible Error, gameId not found in games list');
			return;
		}
		if (io.games[gameID].inProgress) {
			problem('Game has already started');
			return;
		}
		
		// Set the struct to start
		io.games[gameID].inProgress = true;

		// Then set up that game struct
			// Shuffle the deck
			// Remove some cards (5)
			// Choose an order for players
		fullDeck = shuffleFullDeck();
		removedCards = fullDeck.splice(0,4);
		playerOrder = shuffle(io.games[gameID].playerIDs);
		game = {
			playerOrder : playerOrder,
			currentDeck : fullDeck,
			cardsThrownOut : removedCards,
			currentCard : fullDeck.pop(),
			currentBid : 0,
			currentTurn : 0,
		};
		// Add each player to the game
		for (var i = 0; i < game.playerOrder.length; i++) {
			game[game.playerOrder[i]] = {
				hand : [],
				coins : 8
			};
		}
		io.games[gameID].game = game;
		
		// Then let everyone in the room know that the game has started.
		io.sockets.in(gameID).emit('started', {
			playerOrder : game.playerOrder
		});
		// Let everyone know whose turn it is 
		io.sockets.in(gameID).emit('turn', {
			playerID : game.playerOrder[(game.currentTurn % game.playerOrder.length)],
			card : game.currentCard,
			bid : game.currentBid
		});
	}
    gameSocket.on('start', startGame);

    // When the user takes a card
	function takeCard(msg) {
		console.log('User ' + gameSocket.id + ' trying to take a card');
		gameID = gameSocket.gameID;
		// Throw an error if
			// The user is not in a game
			// If the game has not started
			// It is not the user's turn
		if (!gameID) {
			problem('Not in a game. Create a new game to start playing.');
			return;
		}
		if (!io.games[gameID]) {
			console.log('Game not found, abort abort');
			problem('Server error in takeCard')
			return;
		}
		if (!io.games[gameID].inProgress) {
			problem('Start the game in order to play');
			return;
		}

		game = io.games[gameID].game;
		if (!(gameSocket.id == game.playerOrder[game.currentTurn % (game.playerOrder.length)])) {
			problem('Not your turn');
			return;
		}

		// Otherwise
			// Give the user the card
			// Give the user the bid
			// Reset the bid
			// If this was the last card
				// End the game
				// Compute the scores
				// Figure out who won
				// Alert everyone
			// Otherwise
				// Pull the next card and figure out whose turn is next
				// Alert everyone
		game[gameSocket.id].hand.push(game.currentCard);
		game[gameSocket.id].coins += game.currentBid;
		// Alert everyone
		io.sockets.in(gameID).emit('taken', {
			playerID : gameSocket.id,
			card : game.currentCard,
			bid : game.currentBid
		});
		game.currentBid = 0;
		// Increment the turn once
		game.currentTurn += 1;
		if (game.currentDeck.length > 0) {
			game.currentCard = game.currentDeck.pop();
			// Let everyone know whose turn it is 
			io.sockets.in(gameID).emit('turn', {
				playerID : game.playerOrder[(game.currentTurn % game.playerOrder.length)],
				card : game.currentCard,
				bid : game.currentBid
			});
		} else {
			results = [];
			for (var i = 0; i < game.playerOrder.length; i++) {
				playerID = game.playerOrder[i];
				results[i] = {
					playerID : playerID, 
					hand : game[playerID].hand, 
					score : scoreHand(game[playerID].hand, game[playerID].coins)
				};
			}
			console.log(results);
			io.sockets.in(gameID).emit('ended', {
				results : results
			});
		}
	}
    gameSocket.on('take', takeCard);

    // When the user passes a card
	function passCard(msg) {
		console.log('User ' + gameSocket.id + ' trying to pass a card');
		gameID = gameSocket.gameID;
		// Throw an error if
			// The user is not in a game
			// The game has not started
			// It is not the user's turn
			// The user does not have enough money to bid
		if (!gameID) {
			problem('Not in a game. Create a new game to start playing.');
			return;
		}
		if (!io.games[gameID]) {
			console.log('Game not found, abort abort');
			return;
		}
		if (!io.games[gameID].inProgress) {
			problem('Start the game in order to play');
			return;
		}
		game = io.games[gameID].game;
		if (!(gameSocket.id == game.playerOrder[game.currentTurn % (game.playerOrder.length)])) {
			problem('Not your turn');
			return;
		}
		if (game[gameSocket.id].coins == 0) {
			problem('Not enough money to pass. You must take the card.');
			return;
		}
		// Otherwise
			// Take one money from the user and add it to the current bid
		game[gameSocket.id].coins -= 1;
		game.currentBid += 1;
		game.currentTurn += 1;
		// Let everyone know that they've passed
		io.sockets.in(gameID).emit('passed', {
			playerID : gameSocket.id,
			card : game.currentCard,
			bid : game.currentBid
		});
		io.sockets.in(gameID).emit('turn', {
			playerID : game.playerOrder[(game.currentTurn % game.playerOrder.length)],
			card : game.currentCard,
			bid : game.currentBid
		});
	}
    gameSocket.on('pass', passCard);
	
	function endGame(msg) {
		console.log('User ' + gameSocket.id + ' trying to end the game');
		// Throw an error if
			// The user is not in a game
			// The game has not started
		gameID = gameSocket.gameID;
		if (!gameID) {
			problem('Not in a game so cannot end game');
			return;
		}
		if (!io.games[gameID]) {
			console.log('Game not found, abort abort');
			return;
		}
		if (!io.games[gameID].inProgress) {
			problem('Game has not yet started. Cannot end game');
			return;
		}
		// End the game and 
		io.games[gameID].inProgress = false;
		// Let everyone know
		results = [];
		for (var i = 0; i < game.playerOrder.length; i++) {
			playerID = game.playerOrder[i];
			results[i] = {
				playerID : playerID, 
				hand : game[playerID].hand, 
				score : scoreHand(game[playerID].hand, game[playerID].coins)
			};
		}
		console.log(results);
		io.sockets.in(gameID).emit('ended', {
			results : results
		});
	}
    gameSocket.on('end', endGame);

	function leaveGame(msg) {
		console.log('User ' + gameSocket.id + ' trying to leave the game room');
		// Throw an error if 
			// The user is not in a game
			// The game is in progress
		gameID = gameSocket.gameID;
		if (!gameID) {
			problem('No game to leave');
			return;
		}
		if (!io.games[gameID]) {
			console.log('Game not found, abort abort');
			return;
		}
		if (io.games[gameID].inProgress) {
			problem('Cannot leave in the middle of a game');
			return;
		}
		// Remove the user from the player list
		index = io.games[gameID].playerIDs.indexOf(gameSocket.id);
		io.games[gameID].playerIDs.splice(index, 1);
		// Leave the SocketIO room
		gameSocket.leave(gameID);
		// Remove flag on the user socket
		delete gameSocket.gameID;
		// Alert everyone in the game
		io.sockets.in(gameID).emit('playerleft', {playerID : gameSocket.id});
		// If this was the last user in the game room
			// Delete this element from the dictionary with delete keyword
		if (io.games[gameID].playerIDs.length == 0) {
			delete io.games[gameID];
		}
		// Let the client know
		gameSocket.emit('exited');
	}
    gameSocket.on('leave', leaveGame);

    gameSocket.on('disconnect', function(){
        console.log('User disconnected: ' + gameSocket.id);
    });
}

/**
 * Shuffle taken from StackOverflow
 * http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
 */ 
function shuffle(array) {   
    var currentIndex = array.length, temporaryValue, randomIndex;    
    
    // While there remain elements to shuffle...   
    while (0 !== currentIndex) {      
			// Pick a remaining element...     
		randomIndex = Math.floor(Math.random() * currentIndex);     
		currentIndex -= 1;      
		// And swap it with the current element.     
		temporaryValue = array[currentIndex];     
		array[currentIndex] = array[randomIndex];     
		array[randomIndex] = temporaryValue;   
    }
    return array; 
}

function shuffleFullDeck() {
    // Create our deck
    start = 4;
    end = 44;
    deck = []
    for (var i = start; i <= end; i++) {
		deck.push(i);
    }
    return shuffle(deck);
}

function scoreHand(hand, moneys) {
	hand.sort();
	console.log(hand);
	score = hand[0];
	for (var i = 1; i < hand.length; i++) {
		if (hand[i-1] != (hand[i] - 1)) {
			score += hand[i];
		}
	}
	console.log(score);
	return score - moneys;
}