//Crete 'constant' variables
//The number of radians the ship can turn in one second
var NUM_NORMAL_PIGS = 150;
var NUM_RAINBOW_PIGS = 25;
var NUM_AIS = 5;

var LASER_SPEED = 0;
var LASER_LENGTH = 1000;
var LASER_TTL = 100000;

//The width and height of each background tile
var BACKGROUND_SIZE = 2048;

//The width and height of the universe
var UNIVERSE_SIZE = 4096;

//How long the outputs thingy should display after an output is added before it is hidden
var OUTPUT_SHOW_TIME = 5000;

//How many individual output strings should be displayed at one time
var MAX_OUTPUTS = 5;

//When two identical outputs are outputted in a row, this determines whether the new output should be outputted...
var REPEAT_OUTPUTS = true;

var canvas;
var userArea;
var blocklyDiv;
var workspace;
var currentKeys = [];
var currentMouse = {x: 0, y: 0, left: false, right: false, center: false, wheel: 0};
var lastUpdate = -1;


var spriteBatch = Object.create(SpriteBatch);

var background1 = new Sprite();
var background2 = new Sprite();
var background3 = new Sprite();
var background4 = new Sprite();

var ais = [];
var pigs = [];
var lasers = [];

var lasertexture;

var outputs = [];
var lastOutput = new Date().getTime();

var pdp = false;

//Фтв тщц Ш цшдд ензу шт кгыышф срфкфсеукыб ащк тщ куфыщт црфе ыщумук щерук ерту ерфе Ш сфт!!!
//A list of key codes and the keys whivh they coorespond to!
var keys = { 8:"Backspace",  9:"Tab",  13:"Enter", 16:"Shift", 17:"Control", 18:"Alt", 19:"Pause", 20:"Caps Lock", 27:"Escape", 32: "Space", 33:"Page Up", 34:"Page Down", 35:"End", 36:"Home",
	37:"Left Arrow", 38:"Up Arrow", 39:"Right Arrow", 40:"Down Arrow", 45:"Insert", 46:"Delete", 47:"", 48:"0", 49:"1", 50:"2", 51:"3", 52:"4", 53:"5", 54:"6", 55:"7", 56:"8",
	57:"9", 58:"0", 65:"a", 66:"b", 67:"c", 68:"d", 69:"e", 70:"f", 71:"g", 72:"h", 73:"i", 74:"j", 75:"k", 76:"l", 77:"m", 78:"n", 79:"o", 80:"p", 81:"q", 82:"r", 83:"s",
	84:"t", 85:"u", 86:"v", 87:"w", 88:"x", 89:"y", 90:"z", 91:"Left Window Key", 92:"Right Window Key", 93:"Select Key", 96:"Numpad 0", 97:"Numpad 1", 98:"Numpad 2",
	99:"Numpad 3", 100:"Numpad 4", 101:"Numpad 5", 102:"Numpad 6", 103:"Numpad 7", 104:"Numpad 8", 105:"Numpad 9", 106:"Multiply", 107:"Add", 109:"Subtract", 110:"Decimal Point",
	111:"Divide", 112:"f1", 113:"f2", 114:"f3", 115:"f4", 116:"f5", 117:"f6", 118:"f7", 119:"f8", 120:"f9", 121:"f10", 122:"f11", 123:"f12", 144:"Num Lock", 145:"Scroll Lock",
	186:";", 187:"=", 188:",", 189:"-", 190:".", 191:"/", 192:"`", 219:"{", 220:"\\", 221:"}", 222:"'" };

function moveShip(x, y)
{
	ship.x += x;
	ship.y += y;
}

//Turns the ship in a specified direction, at a specified number of radians per second
function turnShip(direction='left', speed=Math.PI, elapsed=20)
{
	//Clamp speed to less then 100
	speed = speed>ship.maxTurn?ship.maxTurn:speed;
	
	//Clamp speed to greater then zero
	speed = speed<-ship.maxTurn?-ship.maxTurn:speed;
	
	//Compute the change in direction
	var deltaDirection = ship.maxTurn * speed * (elapsed / 1000);
	
	//Determine whter the change in direction should be positive or negative
	//If the space ship is turning left, the change in direction should be positive
	deltaDirection *= (direction=="left"||direction=="l")?-1:1;
	
	ship.rotation += deltaDirection;
	ship.direction += deltaDirection;
}


function handleKeyDown(event) {
	if(!currentKeys[keys[event.keyCode]])
		currentKeys[keys[event.keyCode]] = true;
}

function handleKeyUp(event) {
	currentKeys[keys[event.keyCode]] = false;
}

function handleMouseMove(event) {
	currentMouse.x = event.clientX;
	currentMouse.y = event.clientY;
}

function handleMouseDown(event) {
	currentMouse.left = event.buttons % 2 == 1;
	currentMouse.right = Math.trunc(event.buttons / 2) % 2 == 1;
	currentMouse.center = Math.trunc(event.buttons / 4) % 2 == 1;
}

function handleMouseUp(event) {
	currentMouse.left = event.buttons % 2 == 1;
	currentMouse.right = Math.trunc(event.buttons / 2) % 2 == 1;
	currentMouse.center = Math.trunc(event.buttons / 4) % 2 == 1;
}

function handleMouseWheel(event) {
	//For firefox
	if(event.deltaY !== undefined) {currentMouse.wheel += event.deltaY;}
	//For IE.  Note that IE multiplies all delta values for moiuse wheel by 40
	if(event.wheelDelta !== undefined) {currentMouse.wheel += event.wheelDelta / 40;}
}

function addScript() {
	// Generate JavaScript code and run it.
	//window.LoopTrap = 1000;
	Blockly.JavaScript.INFINITE_LOOP_TRAP = 'if (--window.LoopTrap == 0) throw "Infinite loop.";\n';
	var code = Blockly.JavaScript.workspaceToCode(workspace);
	//Blockly.JavaScript.INFINITE_LOOP_TRAP = null;
	
	//Check to see if there are any word or digit charachters
	if(/[\w\d]/.exec(code)) {
		if(!/userUpdate/.exec(code)) { logOutput("<b>Warning:</b> no game control loop detected!"); }
		eval(code);	
		console.log(code);
	}
	
	else {
		console.log("There are no blocks in the workspace...");
		logOutput("There are no blocks in the workspace...");
	}
}

function saveWorkspace() {
	var link = document.getElementById("downloadLink");
	link.href = "data:text/xml;charset=utf-8," + encodeURIComponent(Blockly.Xml.domToPrettyText(Blockly.Xml.workspaceToDom(workspace, true)));
	link.download = "SpacePiggies.xml";
	link.click();
	
}

function logOutput(text) {
	if(checkEgg(text)) {
		outputs = ["<i style='font-size: 2em'>Easter Egg</i>"].concat(outputs);
	}
	
	if(REPEAT_OUTPUTS || outputs[0] != text) {
		//add the text to the output list
		outputs = [text].concat(outputs);
	
		//If there are more than five outputs, remove all beyond it
		if(outputs.length > MAX_OUTPUTS) outputs.splice(MAX_OUTPUTS);
	
		//Clear the output elemetn
		outputList.innerHTML = "";
	
		//Add all of the outputs to the outpuyt element
		outputs.forEach(function(i) {
			outputList.innerHTML += "<li class=\"outputItem\">" + i + "</li>";
		} );
	
		
	}
	
	//Store the time that the output was displayed
	lastOutput = new Date().getTime();
		
	//Show the output element
	outputList.hidden = false;
}

function toggleWorkspace() {
	workspace.isVisible = !workspace.isVisible;
	workspace.setVisible(workspace.isVisible);
	document.getElementById("toggleWorkspace").innerHTML = workspace.isVisible?"Hide workspace":"Show workspace";
}

function load() {
	
	pigsCaughtOutput = document.getElementById("pigsCaught");
	outputList = document.getElementById("output");
	
	//Get the canvas
	canvas = document.getElementById("canvas");
	userArea = document.getElementById("userArea");	
	
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	userArea.width = Math.round(window.innerWidth * 0.40) + "px";
	userArea.height = Math.round(window.innerHeight * 0.9) + "px";
	userArea.style.maxHeight = (window.innerHeight * 0.9) + "px";
	
	workspace = Blockly.inject(userArea, {
		toolbox: document.getElementById('toolbox'),
		grid: {spacing: 20,
			length: 3,
			colour: '#ccc',
			snap: false},
		zoom: {controls: true,
			startScale: 1.0,
			maxScale: 3,
			minScale: 0.3,
			scaleSpeed: 1.2},
     		trashcan: true});

	workspace.isVisible = false;
	workspace.setVisible(workspace.isVisible);
	
	window.onresize = function() { 
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		spriteBatch.setViewportWidth(window.innerWidth);
		spriteBatch.setViewportHeight(window.innerHeight);
	};

	userUpdate = function(elapsed) {

		if (currentKeys["w"]) {
			ship.x += (ship.maxSpeed / 2) * Math.cos(ship.direction) * (elapsed / 1000);
			ship.y += (ship.maxSpeed / 2)* Math.sin(ship.direction) * (elapsed / 1000);
		}

		if (currentKeys["a"]) {
			turnShip("l", ship.maxTurn/ 2, elapsed);
		}

		if (currentKeys["d"]) {
			turnShip("r", ship.maxTurn/ 2, elapsed);
		}

		if (currentKeys["Space"]) {
			ship.fireForwardBlaster(elapsed);
			ship.fireSternchaser(elapsed);
			ship.firePortBroadside(elapsed);
			ship.fireStarboardBroadside(elapsed);
		}
	};
	
	
	
	//console.log(userButton);

	//prepare the spritebatch
	spriteBatch.initialize(canvas);

	//Load the textures
	for(i in shipParams) {
		shipParams[i].getTexture(spriteBatch);
	}
	
	asteroidTexture = spriteBatch.loadTexture("https://raw.githubusercontent.com/tux2603/spacePiggiesBlockly/main/SpacePiggies/Images/asteroid_big1.png");
	pixel = spriteBatch.loadTexture("https://raw.githubusercontent.com/tux2603/spacePiggiesBlockly/main/SpacePiggies/Images/Pixel.png");
	laserTexture = spriteBatch.loadTexture("https://raw.githubusercontent.com/tux2603/spacePiggiesBlockly/main/SpacePiggies/Images/laser.png");
	var backgroundTexture = spriteBatch.loadTexture("https://raw.githubusercontent.com/tux2603/spacePiggiesBlockly/main/SpacePiggies/Images/stars2.png", false);
	
	rainbowPiggyTexture = spriteBatch.loadTexture("https://raw.githubusercontent.com/tux2603/spacePiggiesBlockly/main/SpacePiggies/Images/RainbowPiggy.png");
	rainbowPiggyTexture.numFrames = 4;
	
	piggyTexture = spriteBatch.loadTexture("https://raw.githubusercontent.com/tux2603/spacePiggiesBlockly/main/SpacePiggies/Images/Piggy.png");
	piggyTexture.numFrames = 4;

	
	ship = new Ship();
	ship.setParams(shipParams.basicShip, spriteBatch);
	ship.x = 0; //canvas.width / 2;
	ship.y = 0; //canvas.height / 2;
	ship.velocityX = 0;
	ship.velocityY = 0;
	ship.pigsCaught = 0;
	ship.grayShadeColor = {r:0, g:0, b:1, a:1};
	ship.ammo = 1000; //TODO


	//These variables are used to let the ship travel at greter than its maximum speed for a limited amount of time.
	//When the ship is exceeding maximum speed, the value by which it exceeded is subtracted from the engine Turbo Time
	//In essence, this defines the number of pixels at which the ship can move at greter than its maximum speed
	//When engine turbo time is zero, the ship can no longer travel at greater than its maximum speed.
	ship.turboRemaining = 1000;
	ship.maxTurbo = 1000;

	//Usually, the absolute maximum speed of the ship will be equal to the standared max speed plus the turbo speed
	ship.turboSpeed = 750;

	//If the turbo remianing is less tahn the turbo cutoff, the absolute maximum speed of the ship is proportinal to the turbo remaining
	ship.turboCutoff = 500;

	//Disable the clamp speed function for the space ship
	ship.clampSpeed = function() {return;};

	//Because, after all, whose ever heard of a space ship that didn't perform at greater than 100% at some point?

	background1.width = BACKGROUND_SIZE;
	background1.height = BACKGROUND_SIZE;
	background1.texture = backgroundTexture;

	background2.width = BACKGROUND_SIZE;
	background2.height = BACKGROUND_SIZE;
	background2.x = -BACKGROUND_SIZE;
	background2.texture = backgroundTexture;

	background3.width = BACKGROUND_SIZE;
	background3.height = BACKGROUND_SIZE;
	background3.y = -BACKGROUND_SIZE;
	background3.texture = backgroundTexture;

	background4.width = BACKGROUND_SIZE;
	background4.height = BACKGROUND_SIZE;
	background4.x = -BACKGROUND_SIZE;
	background4.y = -BACKGROUND_SIZE;
	background4.texture = backgroundTexture;

	for(var i = 0; i < NUM_AIS; i++)
	{
		var ai = new Ship();
		ai.setParams(shipParams.aiShip, spriteBatch);
		ai.x = Math.random() * UNIVERSE_SIZE - UNIVERSE_SIZE / 2;
		ai.y = Math.random() * UNIVERSE_SIZE - UNIVERSE_SIZE / 2;
		ai.velocityX = 0;
		ai.velocityY = 0;
		ai.pigsCaught = 0;
		ai.grayShadeColor = {r:Math.random(), g:Math.random(), b:Math.random(), a:1};
		ai.direction = Math.random() * Math.PI * 2;
		ai.rotation = ai.direction;
		ai.speed = ai.maxSpeed
		ai.aiUpdate = aiUpdate.bind(ai);
		ais[i] = ai;
	}
	
	for(var i = 0; i < NUM_NORMAL_PIGS; i++) {
		addPig("normal");
	}
	
	for(var i = 0; i < NUM_RAINBOW_PIGS; i++) {
		addPig("rainbow");
	}
	
	pigs[0].x = 100;
	pigs[0].y = 0;
	pigs[0].speed = 0;
	pigs[0].rotation = 0;
	pigs[0].rotationalVelocity = 0;
	
	//console.log(spriteBatch);
	// spriteBatch.begin();
	// spriteBatch.draw(s);

	//Set the handlers
	document.onkeydown = handleKeyDown;
	document.onkeyup = handleKeyUp;
	document.onmousemove = handleMouseMove;
	document.onmousedown = handleMouseDown;
	document.onmouseup = handleMouseUp;
	document.onwheel = handleMouseWheel; 		// for firefox
	document.onmousewheel = handleMouseWheel;	// for IE

	lastUpdate = new Date().getTime();

	tick();
	
};

function addPig(type) {
	var pig = new Sprite();

	if(type=="rainbow") {
		pig.texture = rainbowPiggyTexture;
		pig.value = 5;
		pig.type = "rainbow";
	}

	else {
		pig.texture = piggyTexture;
		pig.value = 1;
		pig.type = "normal";
	}

	pig.width = 128/pig.texture.numFrames;
	pig.height = 32;
	pig.x = Math.random() * UNIVERSE_SIZE - UNIVERSE_SIZE / 2;
	pig.y = Math.random() * UNIVERSE_SIZE - UNIVERSE_SIZE / 2;
	pig.originX = pig.width / 2;
	pig.originY = pig.height / 2;
	pig.direction = Math.random() * Math.PI * 2;
	pig.rotation = pig.direction;
	pig.rotationalVelocity = 0.01 + Math.random() * 0.02;
	pig.speed = 50;
	pig.numFrames.x = pig.texture.numFrames;
	pig.setAnimationInterval(100);

	pigs[pigs.length] = pig;
}

function tick() {
	requestAnimFrame(tick);
	update();
	draw();
};

function update() {
	var timeNow = new Date().getTime();
	var elapsed = 20;
        if (lastUpdate != 0) var elapsed = timeNow - lastUpdate;
	lastUpdate = timeNow;
	
	ship.moveAndWrap(elapsed, UNIVERSE_SIZE);
	clampShip(elapsed);
	
	nearestPig = null;
	var nearestPigDistance = null;

	for (var i in pigs) {
		var pig = pigs[i];
		pig.moveAndWrap(elapsed, UNIVERSE_SIZE);
		pig.rotation += pig.rotationalVelocity;
		
		if(pig.isAlive === false) {
			pigs.splice(i, 1);
		}

		//If the pig is alive
		else {
			//get the distance to the pig
			var dx = pig.x - ship.x;
			var dy = pig.y - ship.y;

			var distance = Math.sqrt(dx*dx + dy*dy);

			if(nearestPig === null || distance < nearestPigDistance) {
				nearestPig = pig;
				nearestPigDistance = distance;
			}
		}
	}
	
	for (var i in ais) {
		var ai = ais[i];
		ai.aiUpdate(elapsed, i == 0);
		ai.moveAndWrap(elapsed, UNIVERSE_SIZE);

		if(ai.health < 0) {
			ais.splice(i, 1);
		}
	}

	for (var i in lasers) {
		var laser = lasers[i];

		if(laser.isAlive === false) {
			lasers.splice(i, 1);
		}

		else {
			laser.moveAndVanish(elapsed, UNIVERSE_SIZE);
		}
	}
	
	
	if(typeof userUpdate === 'function') userUpdate(elapsed);

	ship.wrap(UNIVERSE_SIZE);
	
	//Clamp ship speed and ship rotation to the maximum values
	clampShip(elapsed);

	if(ship.x > UNIVERSE_SIZE / 2) ship.x -= UNIVERSE_SIZE;

	

	//Get what portion of the background tiles the ship is in
	backgroundX =  Math.round(ship.x / BACKGROUND_SIZE);
	backgroundY =  Math.round(ship.y / BACKGROUND_SIZE);

	background1.x = BACKGROUND_SIZE * backgroundX;
	background2.x = -BACKGROUND_SIZE + BACKGROUND_SIZE * backgroundX;
	background3.x = BACKGROUND_SIZE * backgroundX;
	background4.x = -BACKGROUND_SIZE + BACKGROUND_SIZE * backgroundX;


	background1.y = BACKGROUND_SIZE * backgroundY;
	background2.y = BACKGROUND_SIZE * backgroundY;
	background3.y = -BACKGROUND_SIZE + BACKGROUND_SIZE * backgroundY;
	background4.y = -BACKGROUND_SIZE + BACKGROUND_SIZE * backgroundY;

	var centerSprite = ship;

	//Get the location of the center of the ship
	var viewportX = centerSprite.x + centerSprite.originX;
	var viewportY = centerSprite.y + centerSprite.originY;

	//Lock the locations found to within the size of the universe
	if(viewportX > UNIVERSE_SIZE / 2 - canvas.width / 2) viewportX = UNIVERSE_SIZE / 2 - canvas.width / 2;
	if(viewportX < -UNIVERSE_SIZE / 2 + canvas.width / 2) viewportX = -UNIVERSE_SIZE / 2 + canvas.width / 2;
	if(viewportY > UNIVERSE_SIZE / 2 - canvas.height / 2) viewportY = UNIVERSE_SIZE / 2 - canvas.height / 2;
	if(viewportY < -UNIVERSE_SIZE / 2 + canvas.height / 2) viewportY = -UNIVERSE_SIZE / 2 + canvas.height / 2;

	spriteBatch.setViewportCenter(viewportX, viewportY);

	if(!workspace.isVisible) {
		// checkCollisions();		
	}
	
	//If the elapsed time since the las output is greater than the output show time, hide the outputs;
	if(new Date().getTime() > lastOutput + OUTPUT_SHOW_TIME) {
		document.getElementById("output").hidden = true;
	}

	pigsCaughtOutput.innerHTML = ship.pigsCaught + (ship.pigsCaught!=1?" pigs":" pig") + " caught";

	if(ship.health <= 0) logOutput("You blewed up good!");
}

function getDirectionTo(otherSprite) {
	var dx = otherSprite.getCenter().x - ship.getCenter().x;
	var dy = otherSprite.getCenter().y - ship.getCenter().y;
	
	return getAbsoluteDirection(Math.atan2(dy, dx) - ship.rotation);
}

function getDistanceTo(otherSprite) {
	var dx = otherSprite.getCenter().x - ship.getCenter().x;
	var dy = otherSprite.getCenter().y - ship.getCenter().y;
	
	return Math.sqrt(dx*dx + dy*dy);
}

function clampShip(elapsed=20) {
	//Ideally, each 'last something' should be checked individually, but since we are setting them all
	//	at the same time, if one is undefined, they should all be undefiend.  If they aren't, we have problems!
	if(typeof ship.lastX !== 'undefined') { 
		//Find the changes in the x, y, and rotation attitudes of the ship
		var dX = ship.x - ship.lastX;
		var dY = ship.y - ship.lastY;
		var dR = ship.direction - ship.lastDirection;

		//Calculate a / elapsed, to be used as a multiplier to find the displacements above relative to one second
		var multiplier = elapsed / 1000;

		if(Math.sqrt(dX * dX + dY * dY) / multiplier> ship.maxSpeed) {
			//If the ship still has 'turbo' left
			if(ship.turboRemaining > 0) {
				var turboSpeed = ship.turboRemaining < ship.turboCutoff ? ship.maxSpeed + ship.turboSpeed * ship.turboRemaining / ship.turboCutoff : ship.maxSpeed + ship.turboSpeed;
				//Check to see if the space ship's speed exceeded even the maximum turbo
				if(Math.sqrt(dX * dX + dY * dY) / multiplier > turboSpeed){
					//Clamp the displacement
					//Find the direction of the displacement
					var direction = Math.atan2(dY, dX);

					ship.x = ship.lastX + Math.cos(direction) * turboSpeed * elapsed / 1000;
					ship.y = ship.lastY + Math.sin(direction) * turboSpeed * elapsed / 1000;
				}

				//
				//Subtract the diplacement from turbo remaining
				ship.turboRemaining -= Math.sqrt(dX * dX + dY * dY) - ship.maxSpeed * multiplier;
			}

			//If the ship doesn't have turbo time, clamp the displacment
			else {
				//Find the direction of the displacement
				var direction = Math.atan2(dY, dX);
				ship.x = ship.lastX + Math.cos(direction) * ship.maxSpeed * elapsed / 1000;
				ship.y = ship.lastY + Math.sin(direction) * ship.maxSpeed * elapsed / 1000;
			}
		}	
	}
	ship.lastX = ship.x;
	ship.lastY = ship.y;
	ship.lastDirection = ship.direction;
}

function checkCollisions() {
	pigs.forEach( function(pig) {
		ais.forEach( function(ai) {
			if(ai.isCollided(pig, true)) {
				pig.isAlive = false;
				if(pig.type == "normal") ai.pigsCaught += 1;
				if(pig.type == "rainbow") ai.pigsCaught += 5;	
			}
		});

		if(ship.isCollided(pig, true)) {
			pig.isAlive = false;
			if(pig.type == "normal") ship.pigsCaught += 1;
			if(pig.type == "rainbow") ship.pigsCaught += 5;
		}
	});

	lasers.forEach( function(laser) {
		ais.forEach( function(ai) {
			var dx = (ai.x + ai.originX) - laser.x;
			var dy = (ai.y + ai.originY) - laser.y;
			if(dx * dx + dy * dy < 2500) {
				if(laser.ship != ai && laser.isCollided(ai, false)) {
					laser.isAlive = false;
					ai.health--;
					//break;
				}
			}
		});

		if(laser.ship != ship && ship.isCollided(laser, false)) {
			laser.isAlive = false;
			ship.health--;
		}

	});
}

function draw() {
	
	// if(pdp) {
	// 	spriteBatch.beginFade();

	// 	pigs.forEach( function(pig) {
	// 		spriteBatch.addFade(pig);
	// 	});

	// 	ais.forEach( function(ai) {
	// 		spriteBatch.addFade(ai);
	// 	});

	
	// 	lasers.forEach( function(laser) {
	// 		spriteBatch.addFade(laser);
	// 	});

	
	// 	spriteBatch.addFade(ship);

	// 	spriteBatch.endFade();

	// 	spriteBatch.begin();

	// 	spriteBatch.gl.uniform1i(shaderProgram.monochromeFlag, true);
	// 	spriteBatch.draw(background1);
	// 	spriteBatch.draw(background2);
	// 	spriteBatch.draw(background3);
	// 	spriteBatch.draw(background4);
	// 	spriteBatch.gl.uniform1i(shaderProgram.monochromeFlag, false);

	// 	spriteBatch.drawFade();
	// }

	// else {
		spriteBatch.begin();

		spriteBatch.draw(background1);
		spriteBatch.draw(background2);
		spriteBatch.draw(background3);
		spriteBatch.draw(background4);

		pigs.forEach( function(pig) {
			spriteBatch.draw(pig);
		});

		ais.forEach( function(ai) {
			spriteBatch.draw(ai);
		});

	
		lasers.forEach( function(laser) {
			spriteBatch.draw(laser);
		});


		spriteBatch.draw(ship);
	// }
};
