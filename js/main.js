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
		game.load.spritesheet('person', 'assets/spritesheets/Hero.png', 16, 16);
		game.load.image('kitten', 'assets/spritesheets/catsprite.png');
		game.load.audio('cat1', 'assets/sounds/cat/Cat 1.wav');
		game.load.audio('cat2', 'assets/sounds/cat/Cat 2.wav');
		game.load.audio('cat3', 'assets/sounds/cat/Cat 3.wav');
		game.load.audio('cat4', 'assets/sounds/cat/Cat 4.wav');
		game.load.audio('cat5', 'assets/sounds/cat/Cat 5.wav');
		game.load.audio('cat6', 'assets/sounds/cat/Cat 6.wav');
		game.load.audio('cat7', 'assets/sounds/cat/Cat 7.wav');
		game.load.audio('cat8', 'assets/sounds/cat/Cat 8.wav');
	}

	var map;
	var layer1;
	var layer2;

	var player;
	var kittens;
	var kitten;
	var throwTime = 0;
	var meows = [];
	var people;
	var person;

	var cursors;
	var jumpButton;
	var playerDirection;

	var time;
	var display;
	var gameOver = 0;

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
		layer2.visible = false;

		game.physics.arcade.enable(layer2);
		map.setCollisionByExclusion([],true,layer2);

		for(var i=1; i<=8; i++){
			meows.push(game.add.audio('cat' + i));
		}

		people = game.add.group();
		people.enableBody = true;
		people.physicsBodyType = Phaser.Physics.ARCADE;
		for(var i=0; i<20; i++){
			person = people.create(16 * Math.floor((Math.random() * 100)), game.world.height - (16*Math.floor((Math.random() * 8)+4)), 'person', i%24);
		}


		kittens = game.add.group();
		kittens.enableBody  = true;
		kittens.physicsBodyType = Phaser.Physics.ARCADE;
		kittens.createMultiple(30, 'kitten');
		kittens.setAll('anchor.x', 0.5);
		kittens.setAll('anchor.y', 0.5);
		kittens.setAll('outOfBoundsKill', true);
		kittens.setAll('checkWorldBounds', true);
		kittens.setAll('body.gravity.y', 400);




		player = game.add.sprite(16*6, game.world.height - 64, 'cat-lady');
		player.anchor.setTo(0.5,0.5);

		game.physics.arcade.enable(player);
		player.body.bounce.y = 0.0;
		player.body.gravity.y = 800;
		player.body.collideWorldBounds = true;

		player.animations.add('walk_right', [9, 10, 11], 10, true);
		player.animations.add('walk_left', [27, 28, 29], 10, true);
		player.animations.add('throw_right', [15, 12, 9], 6, false);
		player.animations.add('throw_left', [33, 30, 27], 6, false);

		cursors = game.input.keyboard.createCursorKeys();
		jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

		game.camera.follow(player);
		game.camera.deadzone = new Phaser.Rectangle(100,100,250,400);

	}

	function update(){
		game.physics.arcade.collide(player, layer2);

		game.physics.arcade.overlap(kittens, people, killPerson, null, this);

		if(player.body.onFloor()){
			player.body.velocity.x = 0;
		}
		if (cursors.up.isDown)
		{
			if(game.time.now > throwTime){
				if(playerDirection === 'right'){
					player.animations.play('throw_right',null, false);
				}
				else{
					player.animations.play('throw_left', null, false);
				}
				throwKitten();
			}
		}
		else if (cursors.left.isDown && player.body.onFloor())
		{
			//  Move to the left
			playerDirection = 'left';
			player.body.velocity.x = -150;

//			player.scale.x = 1;
//			if(player.body.onFloor()){
				player.animations.play('walk_left');
//			}
//			else{
//				player.animations.stop();
//				player.frame = 0; 
//			}
		}
		else if (cursors.right.isDown && player.body.onFloor())
		{
			//  Move to the right
			player.body.velocity.x = 150;
			playerDirection = 'right';
//			player.scale.x = -1;
//			if(player.body.onFloor()){
				player.animations.play('walk_right');
//			}
//			else{
//				player.animations.stop();
//				player.frame = 0; 
//			}
		}

		else
		{
			if(!(player.animations.currentAnim === player.animations.getAnimation('throw_right'))||(player.animations.currentAnim === player.animations.getAnimation('throw_left'))){
				
				player.animations.stop();
				player.frame = 27;
				if(playerDirection === 'right'){
					player.frame = 9;
				}
			}
		}
		// Allow player to jump if they are touching the ground.
		if (jumpButton.isDown && player.body.onFloor())
		{
			player.body.velocity.y = -200;
		}

		if(people.total === 0 && !gameOver){
			time = game.time.now;
			gameOver = 1;
			display = game.add.text(game.camera.position.x - 125, game.camera.position.y - 300, 'time: ' + time/1000 + ' seconds', { fontSize: '32px', fill: '#000' });
		}
	}

	function throwKitten(){
		if(game.time.now > throwTime){
			kitten = kittens.getFirstExists(false);
			if(kitten){
				var rand = Math.floor((Math.random() * 16));
				if(rand <8){
					meows[rand].play();
				}
				if(playerDirection === 'left'){
					kitten.reset(player.x - 8, player.y -9);
					kitten.body.velocity.x = player.body.velocity.x -250;
				}
				else{
					kitten.reset(player.x + 8, player.y -9);
					kitten.body.velocity.x = player.body.velocity.x + 250;
				}
				kitten.body.velocity.y = player.body.velocity.y -120;
				throwTime = game.time.now + 500;
			}
		}
	}

	function killPerson(kitten, person){

		person.kill();
		kitten.kill();
	}
}
