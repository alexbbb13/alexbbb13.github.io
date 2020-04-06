// Create the canvas
let canvas = document.createElement("canvas");
let ctx = canvas.getContext("2d");
const SPRITE_SIZE = 32;
const SCREEN_WIDTH = 16*SPRITE_SIZE;
const SCREEN_HEIGHT = 15*SPRITE_SIZE;
const CANVAS_WIDTH = 16; //width of canvas in sprites
const CANVAS_HEIGHT = 15;  //height of canvas in sprites
canvas.width = CANVAS_WIDTH*SPRITE_SIZE;
canvas.height = CANVAS_HEIGHT*SPRITE_SIZE;

document.getElementById("gameContainer").appendChild(canvas);

class Sword {
  constructor(image) { 
  	this.image = image;
  	this.speed = -180;
  	this.isFlying = false;
  	}
  reset() { this.isFlying = false; }
  update(modifier) {
  	if (this.isFlying) {
		this.y += this.speed * modifier;
		if(this.y < -32 ) {
	    	//off screen
	    	this.isFlying = false;	 
		}
	}
  }
  draw (ctx) { 
		if (this.isFlying) {
	 		ctx.drawImage(this.image, this.x, this.y);
		}
  }
  startFrom(x, y) {
  	this.x = x
  	this.y = y
  	this.isFlying = true
  }
}

class Bird {
  constructor(image) { 
  	this.image = image;
  	this.speedY = 50
  	this.xDelta = 0 
  	this.amplitude = 190
  	this.period = Math.PI/6   //Full cycles per second
  	}
  reset() { this.isFlying = false; }
  update(modifier) {
  	this.xDelta +=modifier
  	console.log("update "+this.xDelta)
  	if (this.isFlying) {
		this.y += this.speedY * modifier;
		this.x = 200 + this.amplitude * Math.sin(this.xDelta*this.period);
		if(this.y > SCREEN_HEIGHT) {
	    	//off screen
	    	this.isFlying = false;	 
		}
	}
  }
  draw (ctx) { 
		if (this.isFlying) {
	 		ctx.drawImage(this.image, this.x, this.y);
		}
  }
  startFrom(x, y) {
  	this.x = x
  	this.y = y
  	this.isFlying = true
  }
}

var allSwordsArray = [];
var allBirdsArray = [];

class GarbageCollector {
  constructor() { 
  	this.speed = 10;
  	this.y=0;
  	}
  update(modifier) {
  		this.y += this.speed * modifier;
  		//console.log("update "+this.y)
  		if(this.y > 30 ) {
	    	//start collecting garbage objects
	    	this.y = 0
	    	let oldSize = allSwordsArray.length
	    	allSwordsArray = allSwordsArray.filter(function(item) {
    			return item.isFlying
			})
			allBirdsArray = allBirdsArray.filter(function(item) {
    			return item.isFlying
			})
			//console.log("Collected GarbageCollector objects="+(oldSize-allSwordsArray.length))
		}
  }
}

//Loading objects

let swordReady = false;
let swordImage = new Image();
swordImage.onload = function () {
	swordReady = true;
};
swordImage.src = "images/sword_leo.png";

let birdReady = false;
let birdImage = new Image();
birdImage.onload = function () {
	birdReady = true;
};
birdImage.src = "images/bird.png";


let grassReady = false;
let grassImage = new Image();
grassImage.onload = function () {
	grassReady = true;
};
grassImage.src = "images/grass.png";

let treeReady = false;
let treeImage = new Image();
treeImage.onload = function () {
	treeReady = true;
};
treeImage.src = "images/tree.png";

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

//Level
let level =
'TTTTTTT.TTTTTTTT' +
'TT............TT' +
'T..............T' +
'................' +
'................' +
'................' +
'................' +
'................' +
'................' +
'................' +
'................' +
'.............T..' +
'...T............' +
'....T.......T...' +
'..T...T....TT.TT' +
'..T...T....TT.TT' +
'T..T.T...T..T.T.' +
'...T...T.T....T.' +
'.T........T....T' +
'....T......T....' +
'.T......T.T....T' +
'..T...T....TT.TT' +
'T..T.T...T..T.T.' +
'...T...T.T....T.' +
'.T........T....T' +
'....T......T....' +
'.T......T.T....T' +
'....T.T....T....' +
'....T......T....' +
'....T......T....' +
'....T......TTTT.' +
'....T......T....' +
'....T......T....' +
'....T......T.TT.' +
'T...T......TTT.T' +
'..T...T....TT.TT' +
'..T...T....TT.TT' +
'..T...T....TT.TT' +
'..T...T....TT.TT' +
'..T...T....TT.TT' +
'..T...T....TT.TT' +
'..T...T....TT.TT' +
'..T...T....TT.TT'
// Game objects
var hero = {
	speed: 128 // movement in pixels per second
};
var monster = {
	speed: 192
};
var gameBackground = {
	speed: 10,
	currentLevelLine : 0,
	y: 0,
};

var garbageCollector= new GarbageCollector()

let monstersCaught = 0;
let monsterWon = false;
let canFireNow = true;

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

let resetAllSwords = function (swordArray) {
	swordArray.forEach(element => element.reset())
};

let resetBackground = function () {
	gameBackground.currentLevel = level;
	gameBackground.y = 0;
	gameBackground.endOfLevelReached = false;
	gameBackground.currentLevelLine = (level.length)/CANVAS_WIDTH - CANVAS_HEIGHT ;  
	                                        //currentLevelLine is a property that shows
											//what curent level line is drawn on the top of the screen
											// initially it is calculated as height of the level in lines mimus the height of the screen
											// When y becomes 32 (the screen had shifted 1 line)) currentLevelLine is decremented 
											//until it reaches 0  (top of the level is detected)
											//and we stop drawing top partially visible line in drawBackground
};

// Update game objects
let update = function (modifier) {
	garbageCollector.update(modifier)
	updateHero(modifier);
	updateGoblin(modifier);
	allSwordsArray.forEach(element=>element.update(modifier));
	allBirdsArray.forEach(element=>element.update(modifier));
	updateBackground(gameBackground, modifier);
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
	if (32 in keysDown && canFireNow) { // Player holding space
		addSwordToArray(allSwordsArray , hero.x, hero.y)
		addBirdToArray(allBirdsArray, 200, 0)
		setTimeout(unBlockFire, 350);	
		canFireNow = false;
	}
	if(hero.x < 0 ) hero.x = 0;
	if(hero.x > SCREEN_WIDTH - SPRITE_SIZE ) hero.x = SCREEN_WIDTH - SPRITE_SIZE;
	if(hero.y < 0 ) hero.y = 0;	
	if(hero.y > SCREEN_HEIGHT - SPRITE_SIZE ) hero.y = SCREEN_HEIGHT - SPRITE_SIZE;
};

function unBlockFire() {
   canFireNow = true;
}

let addSwordToArray = function(swordsArray, x, y) {
	let newSword = new Sword(swordImage);
	newSword.startFrom(x,y)
	swordsArray.push(newSword)
}

let addBirdToArray = function(birdsArray, x, y) {
	let newElement = new Bird(birdImage);
	newElement.startFrom(x,y)
	birdsArray.push(newElement)
}

let updateGoblin = function(modifier){
	monster.y += monster.speed * modifier;
	if(monster.y < 0 ) mosnster.y = 0;	 //Should not happen
	if(monster.y > SCREEN_HEIGHT - SPRITE_SIZE) monsterWon=true;
};

let updateBackground = function(background, modifier){
	if (!background.endOfLevelReached){
		background.y += background.speed * modifier;
	}
};

// Draw everything
let render = function () {

	if (grassReady && treeReady) {
	 	drawBackground(gameBackground);
	}

	if (heroReady) {
		ctx.drawImage(heroImage, hero.x, hero.y);
	}

	if (monsterReady) {
		ctx.drawImage(monsterImage, monster.x, monster.y);
	}

	renderAll(allSwordsArray);
	renderAll(allBirdsArray);
	// Score
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Score: " + monstersCaught*10, 32, 32);
};

let renderAll = function(swordsArray){
	swordsArray.forEach(sword => sword.draw(ctx))
}

let drawBackground = function (background){
	let currentCanvasX = 0
	let currentCanvasY = 0
		// Draw top line(partially visible at height -1)

        if (background.y > 32) {
        	background.currentLevelLine--;
        	background.y = 0;
        	if(background.currentLevelLine < 1) {
        		background.endOfLevelReached = true
        		//background.y = 0;
        	}
        }
        // Draw the top partially visible line if the end of level is not reached
        // When the end of the level is reached background stops scrolling
        // see updateBackground
        if (!background.endOfLevelReached) {
	        let globalLevelPos = (background.currentLevelLine - 1) * CANVAS_WIDTH;

				for(let w = 0; w < CANVAS_WIDTH; w++) {
					let x = w*SPRITE_SIZE;
					let levelValue = background.currentLevel.charAt(globalLevelPos+w)
					switch (levelValue) {
						case '.':
							ctx.drawImage(grassImage, x, Math.round(background.y - 32) );//+ background.y);
						break;
						case 'T':
							ctx.drawImage(treeImage, x, Math.round(background.y - 32));//+ background.y); movement works
						break;	
					}
			}
		}

		// Draw the main game field
		globalLevelPos = background.currentLevelLine * CANVAS_WIDTH;

		for(let h = 0; h < CANVAS_HEIGHT; h++) {
			for(let w = 0; w < CANVAS_WIDTH; w++) {
				let levelPos = h*CANVAS_WIDTH+w;
				let x = w*SPRITE_SIZE;
				let y = h*SPRITE_SIZE;
				let levelValue = background.currentLevel.charAt(levelPos + globalLevelPos)
				switch (levelValue) {
					case '.':
						ctx.drawImage(grassImage, x, Math.round(y+background.y));//+ background.y);
					break;
					case 'T':
						ctx.drawImage(treeImage, x, Math.round(y+background.y));//+ background.y); movement works
					break;	
				}
			}	
		}

}

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
resetAllSwords(allSwordsArray);
resetBackground();
main();
