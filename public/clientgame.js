var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

buttonWidth = 193;
buttonHeight = 71

function preload() {
	game.load.spritesheet('button', '/public/button_sprite_sheet.png', buttonWidth, buttonHeight);
}

function create() {
    passButton = game.add.button(game.world.centerX - buttonWidth, 400, 'button', actionOnClick, this, 2, 1, 0);
    takeButton = game.add.button(game.world.centerX, 400, 'button', actionOnClick, this, 2, 1, 0);
}

function update() {
}

function actionOnClick() {
	
}