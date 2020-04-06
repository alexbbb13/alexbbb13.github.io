// Create the canvas
let canvas = document.createElement("canvas");
let ctx = canvas.getContext("2d");
const SPRITE_SIZE = 32;
const SCREEN_WIDTH = 16*SPRITE_SIZE;
const SCREEN_HEIGHT = 15*SPRITE_SIZE; 
canvas.width = 16*SPRITE_SIZE;
canvas.height = 15*SPRITE_SIZE;
document.getElementById("gameContainer").appendChild(canvas);

// Background image
let bgReady = false;
let bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
};
bgImage.src = "images/background.png";

// Hero image
let heroReady = false;
let heroImage = new Image();
heroImage.onload = function () {
	heroReady = true;
};
heroImage.src = "images/hero.png";

// Monster image
let monsterReady = false;
let monsterImage = new Image();
monsterImage.onload = function () {
	monsterReady = true;
};
monsterImage.src = "images/monster.png";

// Game objects
var hero = {
	speed: 128 // movement in pixels per second
};
var monster = {
	speed: 192
};
let monstersCaught = 0;
let monsterWon = false;

// Handle keyboard controls
let keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

// Reset the game when the player catches a monster
let resetGoblin = function () {
	// Throw the monster somewhere on upper portion the screen randomly
	monster.x = SPRITE_SIZE + (Math.random() * (canvas.width - 2*SPRITE_SIZE));
	monster.y = SPRITE_SIZE + (Math.random() * (canvas.height/4 - 2*SPRITE_SIZE));
	monsterWon = false;
};

let resetHero = function () {
	hero.x = canvas.width / 2;
	hero.y = canvas.height / 2;
};


// Update game objects
let update = function (modifier) {
	updateHero(modifier);
	updateGoblin(modifier);
	// Are they touching?

	if(monsterWon) {
		resetGoblin();
		monstersCaught=monstersCaught-3;
		if(monstersCaught < 0) monstersCaught=0;
	} else {
		if (isMonsterCaught()) {
			++monstersCaught;
			resetGoblin();	
		}
	}
};

function isMonsterCaught() {
	return hero.x <= (monster.x + 32)
		&& monster.x <= (hero.x + 32)
		&& hero.y <= (monster.y + 32)
		&& monster.y <= (hero.y + 32)
}

let updateHero = function(modifier){
	if (38 in keysDown) { // Player holding up
		hero.y -= hero.speed * modifier;
	}
	if (40 in keysDown) { // Player holding down
		hero.y += hero.speed * modifier;
	}
	if (37 in keysDown) { // Player holding left
		hero.x -= hero.speed * modifier;
	}
	if (39 in keysDown) { // Player holding right
		hero.x += hero.speed * modifier;
	}
	if(hero.x < 0 ) hero.x = 0;
	if(hero.x > SCREEN_WIDTH - SPRITE_SIZE ) hero.x = SCREEN_WIDTH - SPRITE_SIZE;
	if(hero.y < 0 ) hero.y = 0;	
	if(hero.y > SCREEN_HEIGHT - SPRITE_SIZE ) hero.y = SCREEN_HEIGHT - SPRITE_SIZE;
};

let updateGoblin = function(modifier){
	monster.y += monster.speed * modifier;
	if(monster.y < 0 ) mosnster.y = 0;	 //Should not happen
	if(monster.y > SCREEN_HEIGHT - SPRITE_SIZE) monsterWon=true;
};


// Draw everything
let render = function () {
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
	}

	if (heroReady) {
		ctx.drawImage(heroImage, hero.x, hero.y);
	}

	if (monsterReady) {
		ctx.drawImage(monsterImage, monster.x, monster.y);
	}

	// Score
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Score: " + monstersCaught*10, 32, 32);
};

// The main game loop
let main = function () {
	let now = Date.now();
	let delta = now - then;

	update(delta / 1000);
	render();

	then = now;

	// Request to do this again ASAP
	requestAnimationFrame(main);
};

// Cross-browser support for requestAnimationFrame
let w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
var then = Date.now();
resetHero();
resetGoblin();
main();
