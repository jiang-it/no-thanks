var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

buttonWidth = 193;
buttonHeight = 71;

function preload() {
	game.plugins.add(PhaserInput.Plugin);
	game.load.spritesheet('button', '/public/button_sprite_sheet.png', buttonWidth, buttonHeight);
}

function create() {
    var passButton = game.add.button(game.world.centerX - buttonWidth, 400, 'button', actionOnClick, this, 2, 1, 0);
    var takeButton = game.add.button(game.world.centerX, 400, 'button', actionOnClick, this, 2, 1, 0);
	var password = game.add.inputField(10, 90, {
		font: '40px Arial',
		fill: '#212121',
		fontWeight: 'bold',
		width: 150,
		padding: 8,
		borderWidth: 1,
		borderColor: '#000',
		borderRadius: 6,
		placeHolder: 'GameID',
	});
}

function update() {
}

function actionOnClick() {
	
}