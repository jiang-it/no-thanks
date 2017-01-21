var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

buttonWidth = 193;
buttonHeight = 71;

function preload() {
	game.plugins.add(PhaserInput.Plugin);
	game.load.spritesheet('button', '/public/button_sprite_sheet.png', buttonWidth, buttonHeight);
}

function create() {
	// This is the start
	// Maybe some name inputs? I guess?
	var createButton = game.add.button(game.world.centerX, 100, 'button', onCreate, this, 2, 1, 0);

	var gameIDField = game.add.inputField(game.world.centerX - buttonWidth, 200, {
		font: '40px Arial',
		fill: '#212121',
		fontWeight: 'bold',
		width: buttonWidth,
		padding: 8,
		borderWidth: 1,
		borderColor: '#000',
		borderRadius: 6,
		placeHolder: 'GameID',
	});
	var joinButton = game.add.button(game.world.centerX, 200, 'button', onJoin(gameIDField), this, 2, 1, 0);
	
	// Before a game has been started
	var startButton = game.add.button(game.world.centerX - buttonWidth, 300, 'button', onStart, this, 2, 1, 0);
    var leaveButton = game.add.button(game.world.centerX, 300, 'button', onLeave, this, 2, 1, 0);

	// While a game is happening
    var passButton = game.add.button(game.world.centerX - buttonWidth, 400, 'button', onPass, this, 2, 1, 0);
    var takeButton = game.add.button(game.world.centerX, 400, 'button', onTake, this, 2, 1, 0);
}

function update() {
}

function onCreate() {
	socket.emit('create');
}

function onJoin(gameIDField) {
	return function() {
		socket.emit('join', {gameID : gameIDField.value});
	};
}
	
function onStart() {
	socket.emit('start');
}

function onLeave() {
	socket.emit('leave');
}

function onPass() {
	socket.emit('pass');
}

function onTake() {
	socket.emit('take');
}