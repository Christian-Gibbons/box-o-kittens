window.onload = function() {
	// You might want to start with a template that uses GameStates:
	//     https://github.com/photonstorm/phaser/tree/master/resources/Project%20Templates/Basic

	// You can copy-and-paste the code from any of the examples at http://examples.phaser.io here.
	// You will need to change the fourth parameter to "new Phaser.Game()" from
	// 'phaser-example' to 'game', which is the id of the HTML element where we
	// want the game to go.
	// The assets (and code) can be found at: https://github.com/photonstorm/phaser/tree/master/examples/assets
	// You will need to change the paths you pass to "game.load.image()" or any other
	// loading functions to reflect where you are putting the assets.
	// All loading functions will typically all be found inside "preload()".
    
	"use strict";
    
	var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update });

	function preload() {

		//  Tilemaps are split into two parts: The actual map data (usually stored in a CSV or JSON file) 
		//  and the tileset/s used to render the map.

		//  Here we'll load the tilemap data. The first parameter is a unique key for the map data.

		//  The second is a URL to the JSON file the map data is stored in. This is actually optional, you can pass the JSON object as the 3rd
		//  parameter if you already have it loaded (maybe via a 3rd party source or pre-generated). In which case pass 'null' as the URL and
		//  the JSON object as the 3rd parameter.

		//  The final one tells Phaser the foramt of the map data, in this case it's a JSON file exported from the Tiled map editor.
		//  This could be Phaser.Tilemap.CSV too.

		game.load.tilemap('soviet', 'assets/tilemaps/maps/soviet.json', null, Phaser.Tilemap.TILED_JSON);
		game.load.image('dummy', 'assets/tilemaps/tiles/collision.png');
		//  Next we load the tileset. This is just an image, loaded in via the normal way we load images:

		game.load.image('tiles', 'assets/tilemaps/tiles/PostSovietTile.png');
		game.load.spritesheet('cat-lady', 'assets/spritesheets/sara_16x18.png', 16, 18);
	}

	var map;
	var layer1;
	var layer2;

	var player;

	function create() {

		game.stage.backgroundColor = '#787878';

		//  The 'mario' key here is the Loader key given in game.load.tilemap
		map = game.add.tilemap('soviet');

		//  The first parameter is the tileset name, as specified in the Tiled map editor (and in the tilemap json file)
		//  The second parameter maps this name to the Phaser.Cache key 'tiles'
		map.addTilesetImage('Post Soviet', 'tiles');
		map.addTilesetImage('collision', 'dummy');

		layer1 = map.createLayer('background');
		layer2 = map.createLayer('collision');

		layer1.resizeWorld();
		layer2.resizeWorld();

		game.physics.arcade.enable(layer2);
		map.setCollisionByExclusion([],true,layer2);

		player = game.add.sprite(16*6, game.world.height - 64, 'cat-lady');
		player.anchor.setTo(0.5,0.5);

		game.physics.arcade.enable(player);
		player.body.bounce.y = 0.0;
		player.body.gravity.y = 800;
		player.body.collideWorldBounds = true;

		player.animations.add('walk', [9, 10, 11], 10, true);
	}

	function update(){
		game.physics.arcade.collide(player, layer2);
	}
}
