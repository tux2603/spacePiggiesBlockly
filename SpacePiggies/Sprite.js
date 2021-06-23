//A default fragment shader
var _xFragment = "precision mediump float;\n\
varying vec2 vTextureCoord;\n\
uniform bool uBlackTransparent;\n\
uniform bool uMonochrome;\n\
uniform bool uFade;\n\
uniform vec4 uGrayShadeColor;\n\
uniform sampler2D uSampler;\n\
void main(void) {\n\
	vec4 pColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));\n\
	float len = length(vec3(pColor.r, pColor.g, pColor.b)) / length(vec3(1.0, 1.0, 1.0));\n\
	\n\
	if(uMonochrome) {\n\
		pColor.r = min(len / 2.0, 1.0);\n\
		pColor.g = min(len, 1.0);\n\
		pColor.b = min(len /  2.0, 1.0);\n\
	}\n\
	\n\
	else if(abs(pColor.r - pColor.g) <= 0.1 && abs(pColor.g - pColor.b) <= 0.1 && abs(pColor.r - pColor.b) <= 0.1 ) {\n\
		pColor.r = uGrayShadeColor.r * pColor.r;\n\
		pColor.g = uGrayShadeColor.g * pColor.g;\n\
		pColor.b = uGrayShadeColor.b * pColor.b;\n\
		pColor.a = uGrayShadeColor.a * pColor.a;\n\
	}\n\
	\n\
	if(uFade) {\n\
		pColor *= pColor;\n\
	}\n\
	\n\
	if(uBlackTransparent && !(pColor.r > 0.01 || pColor.g > 0.01 || pColor.b > 0.01)) {\n\
		pColor = vec4(1.0, 0.0, 0.0, 0.0);\n\
	}\n\
	\n\
	gl_FragColor = pColor;\n\
}";
// 

//A default vertex shader
var _xVertex = "attribute vec3 aVertexPosition;\n\
attribute vec2 aTextureCoord;\n\
uniform mat4 uMVMatrix;\n\
uniform mat4 uPMatrix;\n\
varying vec2 vTextureCoord;\n\
void main(void) {\n\
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);\n\
	vTextureCoord = aTextureCoord;\n\
}";

function getAbsoluteDirection(theta) {
	while(theta < -Math.PI) {theta += Math.PI * 2;}
	while(theta >= Math.PI) {theta -= Math.PI * 2;}
	return theta;
}

//utility function to unpack a shader from a given HTML element
function unpackShader(gl, str, type) {
	
	//console.log(str);
	var unpackedShader;
	
	if (type == "fragment") {
		unpackedShader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (type == "vertex") {
		unpackedShader = gl.createShader(gl.VERTEX_SHADER)
	} else {
		return null;
	}
	
	//Set the source of the shader to the text that we found earlier
	gl.shaderSource(unpackedShader, str);

	//Compile the shader
	gl.compileShader(unpackedShader);
	
	//If the shader didn't compile
	if (!gl.getShaderParameter(unpackedShader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(unpackedShader));
		return null;
	}
	
	//If everything went right, return the shader
	return unpackedShader;
}

//Don't ask.  This function is magic, designed to deal with multiple different browsers in the same way.
window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
           window.setTimeout(callback, 1000/60);
         };
})();

function Point(x, y) {
	this.isPointObject = true;

	//The x and y coordinates of the point
	this.x = x===undefined?0:x; 
	this.y = y===undefined?0:y;

	//Transformsa the point by a specified 4x4 matrix
	this.transform = function(matrix) {
		x = this.x;
		y = this.y;
		this.x = x * matrix[0] + y * matrix[4] + matrix[12];
		this.y = x * matrix[1] + y * matrix[5] + matrix[13];
		//return this, to enable method chaining
		return this;
	};
}

var Rectangle = {
	x: 0,
	y: 0,
	width: 1,
	height: 1,

	//Sets the rectangle to the smallest rectangle that contains a set of points
	contain: function() {
		//Get an array of points passed to the function
		var points = [].slice.call(arguments);

		if(typeof points[0] == "object")
		{
			var minX = points[0].x;
			var maxX = points[0].x;
		
			var minY = points[0].y;
			var maxY = points[0].y;

			for(var i = 1; i < points.length; i++)
			{
				minX = Math.min(points[i].x, minX);
				maxX = Math.max(points[i].x, maxX);

				minY = Math.min(points[i].y, minY);
				maxY = Math.max(points[i].y, maxY);
			}
		
			this.x = minX;
			this.y = minY;

			this.width = maxX - minX;
			this.height = maxY - minY;
		}

		else
		{
			var minX = points[0][0];
			var maxX = points[0][0];
		
			var minY = points[0][1];
			var maxY = points[0][1];

			for(var i = 1; i < points.length; i++)
			{
				minX = Math.min(points[i][0], minX);
				maxX = Math.max(points[i][0], maxX);

				minY = Math.min(points[i][1], minY);
				maxY = Math.max(points[i][1], maxY);
			}
		
			this.x = minX;
			this.y = minY;

			this.width = maxX - minX;
			this.height = maxY - minY;
		}

	},

	intersects: function(otherRect) {
		return this.x <= otherRect.x + otherRect.width && 
			this.x + this.width >= otherRect.x &&
			this.y <= otherRect.y + otherRect.height && 
			this.y + this.height >= otherRect.y;
	},
	
	toString: function() {
		return "{" + this.x + ", " + this.y + ", " + this.width + ", " + this.height + "}";
	}
};

function Sprite() {
	//A descrption of the sprite's position and attitude
	this.x = 0;
	this.y = 0;
	this.rotation = 0;
	this.originX = 0;
	this.originY = 0;

	//A description of the sprite's size
	this.width = 1;
	this.height =  1;
	
	//A description of the sprite's velocity, in pixels per second
	this.speed = 0; this.direction = 0;
	
	//A maximum speed that the sprite can obtain.  To be effective 'clampSpeed' must be called
	this.maxSpeed = 500; this.minSpeed = -500;

	this.maxHealth = null;
	this.health = null;
	
	this.texture = null;

	//Whether or not the sprite is 'alive', ans thusly, whether or not it should be drawn
	this.isAlive = true;

	//The 'time to live' for the sprite;
	this.ttl = null;
	
	//Animation parameters
	//TODO:  add animation rfames in the y direction
	this.numFrames = {x:1, y:1};
	this.currentFrame = {x:0, y:0};
	
	//The number of milliseconds per frame
	this.msPerFrame = 100;

	//Three 'private' variables used to memorize the sprite's location matrices and bounding rectangles
	this._lastMatrix = { matrix: undefined };
	this._lastInverseMatrix = { matrix: undefined };
	this._lastRectangle = { rectangle: undefined };

	this.toString = function() {
		return "A sprite at (" + this.x + ", " + this.y + ") with rotation of " + this.rotation + ".";
	};
	
	this.log = function() {
		console.log(this.texture);
	};
	
	this.setColor = function(color) {
		color = /#[1234567890abcdefABCDEF]{6}/.exec(color);
		//Check to see that a valid color was entered
		if(color !== null && color[0] !== undefined) {
			var r = parseInt(color[0].substring(1,3), 16) / 255.0;
			var g = parseInt(color[0].substring(3,5), 16) / 255.0;
			var b = parseInt(color[0].substring(5), 16) / 255.0;
			this.grayShadeColor = {r:r, g:g, b:b, a:1};
		}
	};
	
	//Gets the center, ie the (x, y) vector plus the origin vector
	this.getCenter = function() {
		return {x: this.x + this.originX, y: this.y + this.originY };
	};

	//Gets the velocity of the sprite
	this.getVelocity = function() {
		return { x: this.speed * Math.cos(this.direction), 
			y: this.speed * Math.sin(this.direction) };
	};
	
	//Clamps the sprites speed to the maximum spped allowed by this.maxSpeed
	this.clampSpeed = function() {
		this.speed = this.speed>this.maxSpeed?this.maxSpeed:this.speed;
		this.speed = this.speed<this.minSpeed?this.minSpeed:this.speed;
	};
	
	this.setVelocity = function(x=0, y=0) {
		this.direction = Math.atan2(y, x);
		this.speed = Math.sqrt(x*x + y*y);
		this.clampSpeed();
	};
	
	//accelerates the sprite by a certain number of pixels per second in the direction that it is already heading
	//If two arguments are supplied, it will accelerate the x component of the sprite's velocity by the first argument and
	//	the y component of the sprites velocity by the second argumnet
	this.accelerate = function(elapsed=20, x=0, y=null) {
		//If a y component was given
		if(y!==null) {
			//Get the components of the velocity
			var vX = this.getVelocity().x;
			var vY = this.getVelocity().y;
			
			//Chenge the components of the velocity by thre specified amount
			vX += x * elapsed / 1000;
			vY += y * elapsed / 1000;
			
			//Set the new velocity
			this.setVelocity(vX, vY);
			
		}
		
		else {
			this.speed += x * elapsed / 1000;
		}
		
		//Make sure the new velocity doesn't exceed the maximum 
		this.clampSpeed();
	};
	
	this.wrap = function(worldSize) {
		worldSize = typeof worldsize !== 'number'?worldSize:10000;
		
		var rect = this.getBoundingRectangle();

		if(rect.x > worldSize / 2) {
			this.x -= worldSize + rect.width;
			//If the lastX value is being used, decrement it too
			this.lastX ? this.lastX -= worldSize + rect.width: null;
		}

		else if(rect.x + rect.width < -worldSize / 2) {
			this.x += worldSize + rect.width;
			this.lastX ? this.lastX += worldSize + rect.width: null;
		}

		if(rect.y > worldSize / 2) {
			this.y -= worldSize + rect.height;
			this.lastY ? this.lastY -= worldSize + rect.height: null;
		}

		else if(this.y + rect.height < -worldSize / 2) {
			this.y += worldSize + rect.height;
			this.lastY ? this.lastY += worldSize + rect.height: null;
		}
	};
	
	//Moves the sprite (adds the sprites velocity vector to the sprites location vector)
	this.move = function(elapsedTime=20) {
		this.x += this.speed * Math.cos(this.direction) * (elapsedTime / 1000.0);
		this.y += this.speed * Math.sin(this.direction) * (elapsedTime / 1000.0);

		if(this.ttl !== null) {
			this.ttl -= elapsedTime;
			if(this.ttl < 0) this.isAlive = false;
		}
	};

	//Moves the sprite (adds the sprites velocity vector to the sprites location vector), and then 
	//	'wraps' the sprite's position around a tourus with width and height specified by worldSize
	this.moveAndWrap = function(elapsedTime=20, worldSize= 10000) {
		this.move(elapsedTime);

		this.wrap(worldSize);
	};

	//Moves the sprite (adds the sprites velocity vector to the sprites location vector), and then 
	//	sets the sprite's is alive to false if it is beyond the edges of the screen
	this.moveAndVanish = function(elapsedTime=20, worldSize= 10000) {
		if(!this.isAlive) return false;

		this.move(elapsedTime);

		var rect = this.getBoundingRectangle();

		if(rect.x > worldSize / 2) { this.isAlive = false; }

		else if(rect.x + rect.width < -worldSize / 2) { this.isAlive = false; }

		else if(rect.y > worldSize / 2) { this.isAlive = false; }

		else if(this.y + rect.height < -worldSize / 2) { this.isAlive = false; }
	};
	
	//Sets the sprite's animation frame to the next frame in the sequence
	this.nextFrame = function() {
		this.currentFrame.x = (this.currentFrame.x + 1) % this.numFrames.x;
	};
	
	this.setAnimationInterval = function (intervalLength=100) {
		setInterval(this.nextFrame.bind(this), intervalLength);
	};
		
	//TODO: add animation frames in the y direction
	this.getFrame = function() {
		return [
			this.currentFrame.x / this.numFrames.x, 0,
			(this.currentFrame.x + 1) / this.numFrames.x, 0,
			(this.currentFrame.x + 1) / this.numFrames.x, 1,
			this.currentFrame.x / this.numFrames.x, 1
		];
		
		
	};
	
	this.getMatrix = function() {
		//Memorization!
		if(this._lastMatrix.x === this.x && this._lastMatrix.y === this.y && this._lastMatrix.width === this.width && this._lastMatrix.height === this.height 
			&& this._lastMatrix.originX === this.originX && this._lastMatrix.originY === this.originY && this._lastMatrix.rotation === this.rotation) {
			return this._lastMatrix.matrix;
		}
 
		else {
			//Create thetransformation matrix for the sprite

			//Find the cos of the rotation angle and the sin of the rotation angle so we don't have to keep recomputing them throught the matrix
			var sin = -Math.sin(this.rotation);
			var cos = Math.cos(this.rotation);

			//Note that, due to javascripts matrix creation stuff, this matrix will be the 'transpose' of the way it is usually written
			
			//Memorize the sprite's attitude
			this._lastMatrix.x = this.x; 
			this._lastMatrix.y = this.y;
			this._lastMatrix.width = this.width;
			this._lastMatrix.height = this.height;
			this._lastMatrix.originX = this.originX;
			this._lastMatrix.originY = this.originY;
			this._lastMatrix.rotation = this.rotation;

			this._lastMatrix.matrix = [ this.width * cos, -this.width * sin, 0, 0,
				this.height * sin, this.height * cos, 0, 0,
				0, 0, 1, 0,
				this.x + this.originX - this.originX * cos - this.originY * sin, this.y + this.originY -this.originY * cos + this.originX * sin, 0, 1]

			return this._lastMatrix.matrix;
		}
	};

	this.getInverseMatrix = function() {
		//Create thet inverse of the transformation matrix for the sprite

		//Find the cos of the rotation angle and the sin of the rotation angle so we don't have to keep recomputing them throught the matrix
		var sin = -Math.sin(this.rotation);
		var cos = Math.cos(this.rotation);

		//Note that, due to javascripts matrix creation stuff, this matrix will be the 'transpose' of the way it is usually written
		
		//Yup, even uglier than the first matrix.
		return [cos/this.width, sin/this.height, 0, 0, 
			-(sin/this.width), cos/this.height, 0, 0,
			0, 0, 1, 0,
			(this.originX - (this.originX + this.x) * cos + (this.originY + this.y) * sin) / this.width, (this.originY - (this.originY + this.y) * cos - (this.originX + this.x) * sin)/this.height, 0, 1];
	};

	this.getBoundingRectangle = function() {
		//Memorization!
		if(this._lastRectangle.x === this.x && this._lastRectangle.y === this.y && this._lastRectangle.width === this.width && this._lastRectangle.height === this.height 
			&& this._lastRectangle.originX === this.originX && this._lastRectangle.originY === this.originY && this._lastRectangle.rotation === this.rotation) {
			return this._lastRectangle.rectangle;
			//TODO: check that this is working
		}

		else {
			var p1 = new Point(0, 0);
			var p2 = new Point(0, 1);
			var p3 = new Point(1, 0);
			var p4 = new Point(1, 1);

			//Get the sprites transformation matrix
			var matrix = this.getMatrix();

			//Apply the transformation space to the four corners, so as to find where they would be relative to the sprite
			p1.transform(matrix);
			p2.transform(matrix);
			p3.transform(matrix);
			p4.transform(matrix);

			//Get the smallest rectangle that will contain the four corners
			var rect = Object.create(Rectangle);
			rect.contain(p1, p2, p3, p4);
			
			//return rect;

			//Memorize the sprite's attitude
			this._lastRectangle.x = this.x; 
			this._lastRectangle.y = this.y;
			this._lastRectangle.width = this.width;
			this._lastRectangle.height = this.height;
			this._lastRectangle.originX = this.originX;
			this._lastRectangle.originY = this.originY;
			this._lastRectangle.rotation = this.rotation;
			this._lastRectangle.rectangle = rect;

			//And return the rectangle
			return this._lastRectangle.rectangle;
		}
	};
	
	this.isCollided = function(otherSprite, pixelPerfect=true) {
		//First, check to make sure the other sprite is defined!
		if(otherSprite === undefined) return false;

		//If pixel perfect is undefined, it should default to 'true'
		pixelPerfect = pixelPerfect===undefined?true:pixelPerfect;
		//In case you didn't notice, I like using the ternary operator.
		
		//Check to make sure that both sprites are alive
		if(!(this.isAlive && otherSprite.isAlive)) return false;
		//If the bounding rectangles of the two sprites don't intersect, then the two sprites don't collide
		if(!this.getBoundingRectangle().intersects(otherSprite.getBoundingRectangle()) ) return false;
		
		//If pixel perfect collision detection is off, then the two sprites are collided.
		if(!pixelPerfect) return true;
		
		//...And the only way we could get here is if the rectangles intersect and pixelPerfect is true!

		//In pixel perfect collision detectiopn, all transparent pixel are ignored
		for(var x =0; x < this.width; x++) { for(var y = 0; y < this.height; y++) {

			//Check to make sure that tis pixel is translcent/opaque
			if(this.texture.data[x][y].a > 0) {

				//Get the current point
				var p = new Point(x/this.width, y/this.height);

				//Translate the point to the other sprites coordinate system
				p.transform(this.getMatrix());
				p.transform(otherSprite.getInverseMatrix());

				//Scale the point properly
				p.x *= otherSprite.width; p.y *= otherSprite.height;
				//TODO: add a scale function to the point class

				//Round the point to the nearest integer point
				p.x = Math.round(p.x); p.y = Math.round(p.y);
				//console.log(p);
				//Checck to make sure the point is within the other sprite
				if(p.x >= 0 && p.x < otherSprite.width && p.y >= 0 && p.y < otherSprite.height) {
					if(otherSprite.texture.data[p.x][p.y].a > 0) {return true;}
				}
			}

		}} //Note that there are double brackets here because there are two for loops staked untop of eachother	

		return false;
	};
	
}

function Ship() { //EXTENDS Sprite

	this.setParams = function(params, sb) {
		params = params!==undefined?params:shipParams.defaultShip;
	
		this.maxSpeed = params.maxSpeed;
		this.maxTurn = params.maxTurn;
		this.maxHealth = params.maxHealth;
		if(this.health === null) this.health = this.maxHealth;
		this.health = Math.min(this.health, this.maxHealth);

		this.forwardBlaster = params.forwardBlaster;
		this.forwardBlaster.lastFire = this.forwardBlaster.fireRate;

		this.sternchaser = params.sternchaser;
		this.sternchaser.lastFire = this.sternchaser.fireRate;

		this.broadsides = params.broadsides;
		this.broadsides.lastPortFire = this.broadsides.fireRate;
		this.broadsides.lastStarboardFire = this.broadsides.fireRate;

		this.width = params.width;
		this.height = params.height;
		this.originX = params.originX;
		this.originY = params.originY;
		this.texture = params.getTexture(sb);
		this.params = params;
	};

	this.fireForwardBlaster = function(elapsedTime) {
		this.forwardBlaster.lastFire -= elapsedTime;

		while(this.forwardBlaster.lastFire < 0) {

			this.forwardBlaster.lasers.forEach( function(i) { 
				var laser = new Sprite();
				laser.texture = laserTexture;
				laser.x = this.x + this.originX + i.offsetX * Math.cos(this.rotation) - i.offsetY * Math.sin(this.rotation);
				laser.y = this.y + this.originY + i.offsetY * Math.cos(this.rotation) + i.offsetX * Math.sin(this.rotation);
				laser.width = LASER_LENGTH;
				laser.rotation = this.rotation + i.direction;
				laser.direction = laser.rotation;
				laser.speed = LASER_SPEED + this.speed; //Not realistic, but keeps the space ship from running into its own lasers
				laser.ttl= LASER_TTL;
				laser.move(-this.forwardBlaster.lastFire);
				laser.ship = this;
				lasers[lasers.length] = laser;
			}.bind(this) );

			this.forwardBlaster.lastFire += this.forwardBlaster.fireRate;
		}

		
	};

	this.fireSternchaser = function(elapsedTime) {
		this.sternchaser.lastFire -= elapsedTime;

		while(this.sternchaser.lastFire < 0) {

			this.sternchaser.lasers.forEach( function(i) { 
				var laser = new Sprite();
				laser.texture = laserTexture;
				laser.x = this.x + this.originX + i.offsetX * Math.cos(this.rotation) - i.offsetY * Math.sin(this.rotation);
				laser.y = this.y + this.originY + i.offsetY * Math.cos(this.rotation) + i.offsetX * Math.sin(this.rotation);
				laser.width = LASER_LENGTH;
				laser.rotation = this.rotation + i.direction;
				laser.direction = laser.rotation;
				laser.speed = LASER_SPEED;
				laser.ttl= LASER_TTL;
				laser.move(-this.sternchaser.lastFire);
				laser.ship = this;
				lasers[lasers.length] = laser;
			}.bind(this) );

			this.sternchaser.lastFire += this.sternchaser.fireRate;
		}
	};

	this.firePortBroadside = function(elapsedTime) {
		this.broadsides.lastPortFire -= elapsedTime;

		while(this.broadsides.lastPortFire < 0) {

			this.broadsides.lasers.forEach( function(i) { 
				var laser = new Sprite();
				laser.texture = laserTexture;
				laser.x = this.x + this.originX + i.offsetX * Math.cos(this.rotation) - i.offsetY * Math.sin(this.rotation);
				laser.y = this.y + this.originY + i.offsetY * Math.cos(this.rotation) + i.offsetX * Math.sin(this.rotation);
				laser.width = LASER_LENGTH;
				laser.rotation = this.rotation + i.direction;
				laser.direction = laser.rotation;
				laser.speed = LASER_SPEED;
				laser.ttl= LASER_TTL;
				laser.move(-this.broadsides.lastPortFire);
				laser.ship = this;
				lasers[lasers.length] = laser;
			}.bind(this) );

			this.broadsides.lastPortFire += this.broadsides.fireRate;
		}
	};

	this.fireStarboardBroadside = function(elapsedTime) {
		this.broadsides.lastStarboardFire -= elapsedTime;

		while(this.broadsides.lastStarboardFire < 0) {

			this.broadsides.lasers.forEach( function(i) { 
				var laser = new Sprite();
				laser.texture = laserTexture;
				laser.x = this.x + this.originX + i.offsetX * Math.cos(this.rotation) + i.offsetY * Math.sin(this.rotation);
				laser.y = this.y + this.originY - i.offsetY * Math.cos(this.rotation) + i.offsetX * Math.sin(this.rotation);
				laser.width = LASER_LENGTH;
				laser.rotation = this.rotation - i.direction;
				laser.direction = laser.rotation;
				laser.speed = LASER_SPEED;
				laser.ttl= LASER_TTL;
				laser.move(-this.broadsides.lastStarboardFire);
				laser.ship = this;
				lasers[lasers.length] = laser;
			}.bind(this) );

			this.broadsides.lastStarboardFire += this.broadsides.fireRate;
		}
	};
	
	Sprite.call(this);
}

//Have ship inherite the Sprite class functionality
Ship.prototype = Object.create(Sprite.prototype);
Ship.prototype.constructor = Ship;

//An object for drawing sprites
var SpriteBatch = {
	//The webGL renderer
	gl: null,
	
	//Buffers to store a nice, simple square
	vertexPositionBuffer: null,
	vertexTextureBuffer: null,
	vertexIndexBuffer: null,

	//A buffer for fading backgrounds...
	// fadeBuffer: null,

	_dummyCanvas: null,
	
	initialize: function(canvas) {

		//Create an invisible dummy canvas for reading off pixel values from images.
		//Not the most graceful way to do this, but it's quick and easy
		this._dummyCanvas = document.createElement("canvas");

		//Initialze webGL
		//webGL might not always work... so use a try to catch any problems
		try {
			//Set gl to draw to the canvas element that was passed
			this.gl = canvas.getContext("experimental-webgl");
			
			//Get the width and the height of the canvas element
			this.gl.viewportWidth = canvas.width;
			this.gl.viewportHeight = canvas.height;
			this.gl.viewportCenterX = 0;
			this.gl.viewportCenterY = 0;
			this.gl.viewportScale = 1;

		} catch (e) {
			console.log(e);
		}
		
		//if gl did not initialize properly, report an error message
		if(!this.gl) {
			alert("Could not initialize webGL.\n\r\t-☃");
		}
		
		//Unpack and complie the shaders
		fragmentShader = unpackShader(this.gl, _xFragment, "fragment");
		vertexShader = unpackShader(this.gl, _xVertex, "vertex");
	
		//Attatch the shaders to webgl
		//Create a web gl program to handle the shaders
		shaderProgram = this.gl.createProgram();
		
		//Add the shaders to the program, and then add th eprogram to webgl
		this.gl.attachShader(shaderProgram, vertexShader);
		this.gl.attachShader(shaderProgram, fragmentShader);
		this.gl.linkProgram(shaderProgram);
		
		//If the shaders failed to initialize...
		if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
			alert("Could not initialize shaders");
		}
		
		//Tell webgl to use the shaders
		this.gl.useProgram(shaderProgram);
		
		//And now do some magic! 
		shaderProgram.vertexPositionAttribute = this.gl.getAttribLocation(shaderProgram, "aVertexPosition");
		this.gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

		//𝕺𝖇𝖊𝖓 𝖆𝖒 𝕯𝖊𝖚𝖙𝖘𝖈𝖍𝖊𝖓 𝕽𝖍𝖊𝖎𝖓𝖊, 𝖑𝖊𝖍𝖓𝖊𝖙 𝖘𝖎𝖈𝖍 𝕷𝖎𝖊𝖈𝖍𝖙𝖊𝖓𝖘𝖙𝖊𝖎𝖓
		shaderProgram.textureCoordAttribute = this.gl.getAttribLocation(shaderProgram, "aTextureCoord");
		this.gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);
		
		//I found a unicode monkey! 🐵
		shaderProgram.pMatrixUniform = this.gl.getUniformLocation(shaderProgram, "uPMatrix");
		shaderProgram.mvMatrixUniform = this.gl.getUniformLocation(shaderProgram, "uMVMatrix");
		shaderProgram.samplerUniform = this.gl.getUniformLocation(shaderProgram, "uSampler");

		//SUB: Get flags
		//Find the location of the 'gray shade color'
		//This is a color that will replace all shades of gray on the sprite's texture,
		//The value of the color that is replacing will be prportional to the value of the shade of gray.
		shaderProgram.grayShadeColor = this.gl.getUniformLocation(shaderProgram, "uGrayShadeColor");

		shaderProgram.fadeFlag = this.gl.getUniformLocation(shaderProgram, "uFade");
		shaderProgram.monochromeFlag = this.gl.getUniformLocation(shaderProgram, "uMonochrome");
		shaderProgram.blackTransFlag = this.gl.getUniformLocation(shaderProgram, "uBlackTransparent");
		
		//By default, the gray shade color should be white.
		this.gl.uniform4f(shaderProgram.grayShadeColor, 1.0, 1.0, 1.0, 1.0);
	
		//The magic is over, and the shaders are initialized!

		//Initialize the fade buffer
		// this.fadeBuffer = this.gl.createFramebuffer();
		// this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fadeBuffer);
		// this.fadeBuffer.width = 512;
		// this.fadeBuffer.height = 512;

		// //Create a texture for the fade buffer
		// this.fadeTexture = this.gl.createTexture();
		// this.gl.bindTexture(this.gl.TEXTURE_2D, this.fadeTexture);
		// this.gl.texParameteri(this.gl.TEXURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
		// this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
		// this.gl.generateMipmap(this.gl.TEXTURE_2D);

		// //Create a new image for the fade buffer
		// this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.fadeBuffer.width, this.fadeBuffer.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);


		// this.oldFadeTexture = this.gl.createTexture();
		// this.gl.bindTexture(this.gl.TEXTURE_2D, this.oldFadeTexture);
		// this.gl.texParameteri(this.gl.TEXURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
		// this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
		// this.gl.generateMipmap(this.gl.TEXTURE_2D);
		
		// this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.fadeBuffer.width, this.fadeBuffer.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);


		//May or may not be necessary...	##### ##### ##### ##### ##### ##### ##### ##### ##### ##### ##### ##### ##### ##### ##### ##### ##### ##### ##### ##### ##### ##### ##### ##### 
		var renderbuffer = this.gl.createRenderbuffer();
		this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, renderbuffer);
		// this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, this.fadeBuffer.width, this.fadeBuffer.height);

		this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.fadeTexture, 0);
		this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, renderbuffer);

		this.gl.bindTexture(this.gl.TEXTURE_2D, null);
		this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
		//End may or may not be necessary...	##### ##### ##### ##### ##### ##### ##### ##### ##### ##### ##### ##### ##### ##### ##### ##### ##### ##### ##### ##### ##### ##### ##### ##### 



		//Now, initialize the buffers!
		
		//First, create a buffer to hold the positions of the corners of the square
		this.vertexPositionBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexPositionBuffer);
		
		var vertices = [
			//The corners of a square
			0.0, 0.0,  0.0,
			1.0, 0.0,  0.0,
			1.0, 1.0,  0.0,
			0.0, 1.0,  0.0,
		];
		
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
		this.vertexPositionBuffer.itemSize = 3;
		this.vertexPositionBuffer.numItems = 4;

		//Now creeate a buffer holding where on the specific texture each corner of the square is
		//If there is no animation, this will ust be the corners of the texture
		//If there is animation, this will have to change...
		//TODO: provide for animation
		this.vertexTextureBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexTextureBuffer)

		var texture = [
			0, 0,
			1, 0,
			1, 1,
			0, 1
		];

		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(texture), this.gl.STATIC_DRAW);
		this.vertexTextureBuffer.itemSize = 2;
		this.vertexTextureBuffer.numItems = 4;

		//Finally, tell webgl what order the vertices are to be drawn in.
		//There will be two groups of three in this part, one for each triangle that makes up the square
		this.vertexIndexBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
		
		var vertexIndices = [
			0, 1, 2,	0, 2, 3
		];

		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndices), this.gl.STATIC_DRAW);
		this.vertexIndexBuffer.itemSize = 1;
		this.vertexIndexBuffer.numItems = 6;

		//Buffers are loaded!  On with the Show!

		//Ladies aaand Gentlemen!  We have now finished with the main part of our ee-ni-shee-ashun algorithm,
		//but, rest assured, we still have more lines of code!

		//This previous comment can be considered proof as why I'm not the guy that stands outside a traveling show to draw in patrons

		//Set the color that will appear in the background.
		this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
	
		//disable depth testing.... 
		this.gl.disable(this.gl.DEPTH_TEST);
		//And enable blending
		this.gl.enable(this.gl.BLEND);

		//Specify the blending function

		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

		//Set the perspective matrix.  z and w values are identity, and x and y are 2 / viewport (width or height), respectivly
		//This gives us a flat, heads on view of the x and y axis, where a square with side length one will take up one pixel
		//The origin is in the upper left hand corner, y-axis is positive downwards, and x-axis is positive left-wards
		this._updateMatrix();

		//And that wraps up the initialization.
	},

	getViewportRectangle: function() {
		var rect = Object.create(Rectangle);
		rect.x = this.gl.viewportCenterX - this.gl.viewportWidth / 2;
		rect.y = this.gl.viewportCenterY - this.gl.viewportHeight / 2;
		rect.width = this.gl.viewportWidth;
		rect.height = this.gl.viewportHeight;
		return rect;
	},

	_updateMatrix: function() {
		//Set the perspective matrix.  z and w values are identity, and x and y are 2 / viewport (width or height), respectivly
		//This gives us a flat, heads on view of the x and y axis, where a square with side length one will take up one pixel
		//The origin is in the upper left hand corner, y-axis is positive downwards, and x-axis is positive left-wards
		var pMatrix = [ 2.0 * this.gl.viewportScale / this.gl.viewportWidth, 0.0, 0.0, 0.0,
				0.0, -2.0 * this.gl.viewportScale / this.gl.viewportHeight, 0.0, 0.0,
				0.0, 0.0, 1.0, 0.0,
				this.gl.viewportCenterX * -2.0 * this.gl.viewportScale / this.gl.viewportWidth, this.gl.viewportCenterY * 2.0 * this.gl.viewportScale / this.gl.viewportHeight, 0.0, 1.0 ];
		
		//Bind the matrix to the shader
		this.gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
	},
	
	setViewportCenter: function(x=0, y=0) {

		this.gl.viewportCenterX = x;
		this.gl.viewportCenterY = y;

		this._updateMatrix();
	},
	
	setViewportWidth: function(width) {
		//Check that the width given is a number
		if(typeof width !== 'number') return false;
		
		//Store the new width
		this.gl.viewportWidth = width;
		
		this._updateMatrix();
	},
	
	setViewportHeight: function(height) {
		//Check that the width given is a number
		if(typeof height !== 'number') return false;
		
		//Store the new width
		this.gl.viewportHeight = height;
		
		this._updateMatrix();
	},
	
	setViewportScale: function(scale) {
		//Check that the width given is a number
		if(typeof scale !== 'number') return false;
		
		//Store the new width
		this.gl.viewportScale = scale;
		
		this._updateMatrix();
	},

	//Loads a texture from a given file into a webGL texture
	//If the texture will not be used for pixel perfect collision detection, set generatePixelArray to false;
	//This will save both time and memory
	loadTexture: function(src, generatePixelArray=true) {
		generatePixelArray = false;
		
		if(typeof this.gl !== 'undefined')
		{
			var texture = this.gl.createTexture();
			texture.image = new Image();
			texture.image.crossOrigin = "Anonymous";

			if(generatePixelArray) {
				texture.image.onload = function () {
					console.log("texture loaded");

					console.time("Picture");
					//Set the dummy canvas to the picture's size
					this._dummyCanvas.width = texture.image.width;
					this._dummyCanvas.height = texture.image.height;
					
					//Load the picture onto the dummy canvas
					this._dummyCanvas.getContext("2d").drawImage(texture.image, 0, 0, texture.image.width, texture.image.height);

					//Load the pixel data back from the canvas
					var imgData = this._dummyCanvas.getContext("2d").getImageData(0, 0, texture.image.width, texture.image.height);
					
					texture.width = texture.image.width;
					texture.height = texture.image.height;
					texture.data = [];

					for(var i = 0; i < texture.width; i++) texture.data.push([]);

					for(var y = 0; y < texture.height; y++)
					{
						for(var x = 0; x < texture.width; x++)
						{
							texture.data[x][y] = { r:imgData.data[(x + y * texture.image.width) * 4],
								g:imgData.data[(x + y * texture.image.width) * 4 + 1],
								b:imgData.data[1(x + y * texture.image.width) * 4 + 2],
								a:imgData.data[(x + y * texture.image.width) * 4 + 3] };
						}
					}


					this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, false);
					this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
					this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, texture.image);
					this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
					this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_NEARST);
					this.gl.generateMipmap(this.gl.TEXTURE_2D);
					this.gl.bindTexture(this.gl.TEXTURE_2D, null);
					console.timeEnd("Picture");
				}.bind(this);
			}

			else {
				texture.image.onload = function () {
					console.log("texture loaded");
					console.time("Picture");
					
					texture.width = texture.image.width;
					texture.height = texture.image.height;
					texture.data = [{r:0, b:1, g:0, a:0}];
					
					this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
					this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
					this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, texture.image);
					this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
					this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_NEARST);
					this.gl.generateMipmap(this.gl.TEXTURE_2D);
					this.gl.bindTexture(this.gl.TEXTURE_2D, null);
					console.timeEnd("Picture");
				}.bind(this);
			}
			texture.image.src = src;
			return texture;
		}

		else return false;
	},

	begin: function() {
		//Set the viewport
		this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);

		//Clear anything that might be already on the viewport
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexPositionBuffer);
		this.gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.vertexPositionBuffer.itemSize, this.gl.FLOAT, false, 0, 0);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexTextureBuffer);
		this.gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, this.vertexTextureBuffer.itemSize, this.gl.FLOAT, false, 0, 0);


		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);

		this.gl.grayShadeActive = false;
		this.gl.uniform4f(shaderProgram.grayShadeColor, 1.0, 1.0, 1.0, 1.0); 
	},

	setTexture: function(texture) {
		if(this.gl.currentTexture !== texture) {
			this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
			this.gl.currentTexture = texture;
		}
	},

	drawTexture: function(texture, matrix) { //TODO
		this.texturesDrawn = this.texturesDrawn?this.texturesDrawn+1:1;

		//Set the location matrix to the sprite's matrix
		//this.gl.activeTexture(this.gl.TEXTURE0);
		this.setTexture(texture);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(ship.getFrame()), this.gl.STATIC_DRAW);
		this.gl.uniform1i(shaderProgram.samplerUniform, 0);

		this.gl.uniform4f(shaderProgram.grayShadeColor, 1.0, 1.0, 1.0, 1.0);
		
		this.gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, matrix);
		
		this.gl.drawElements(this.gl.TRIANGLES, this.vertexIndexBuffer.numItems, this.gl.UNSIGNED_SHORT, 0);
	},

	draw: function(sprite) {
		if(sprite.isAlive)
		{
			if(sprite.getBoundingRectangle().intersects(this.getViewportRectangle()))
			{
				this.spritesDrawn = this.spritesDrawn?this.spritesDrawn+1:1;

				//Set the location matrix to the sprite's matrix
				this.setTexture(sprite.texture);
				this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(sprite.getFrame()), this.gl.STATIC_DRAW);
				
				if(sprite.grayShadeColor !== undefined) {
					this.gl.uniform4f(shaderProgram.grayShadeColor, sprite.grayShadeColor.r, sprite.grayShadeColor.g, sprite.grayShadeColor.b, sprite.grayShadeColor.a);
					this.gl.grayShadeActive = true;
				}

				else if( this.gl.grayShadeActive) { 
					this.gl.uniform4f(shaderProgram.grayShadeColor, 1.0, 1.0, 1.0, 1.0); 
					this.gl.grayShadeActive = false;
				}

				this.gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, sprite.getMatrix());
				this.gl.drawElements(this.gl.TRIANGLES, this.vertexIndexBuffer.numItems, this.gl.UNSIGNED_SHORT, 0);
			}
		}
	},

	// beginFade: function() {	
		
	// 	this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fadeBuffer);

	// 	this.gl.viewport(0, 0, this.fadeBuffer.width, this.fadeBuffer.height);
	// 	this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

	// 	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexPositionBuffer);
	// 	this.gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.vertexPositionBuffer.itemSize, this.gl.FLOAT, false, 0, 0);

	// 	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexTextureBuffer);
	// 	this.gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, this.vertexTextureBuffer.itemSize, this.gl.FLOAT, false, 0, 0);


	// 	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);

	// 	this.gl.uniform1i(shaderProgram.blackTransFlag, true);
	// 	this.gl.uniform1i(shaderProgram.fadeFlag, true);
		
						
	// 	var pMatrix = [ 1.0, 0.0, 0.0, 0.0,
	// 					0.0, 1.0, 0.0, 0.0,
	// 					0.0, 0.0, 1.0, 0.0, 
	// 					0.0, 0.0, 0.0, 1.0 ];
		
	// 	//Bind the matrix to the shader
	// 	this.gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
		
	// 	this.drawTexture(this.oldFadeTexture, [2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, -1, -1, 0 ,1]);
		
	// 	this._updateMatrix();
		
		
	// 	this.gl.uniform1i(shaderProgram.fadeFlag, false);
	// 	this.gl.uniform1i(shaderProgram.monochromeFlag, true);
		
	// },

	addFade: function(sprite) {
		this.draw(sprite);
	},

	endFade: function() {
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.oldFadeTexture);
		this.gl.copyTexImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 0, 0, 512, 512, 0);
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
		this.gl.uniform1i(shaderProgram.blackTransFlag, false);
		this.gl.uniform1i(shaderProgram.monochromeFlag, false);
		this.gl.uniform1i(shaderProgram.fadeFlag, false);
	},

	//Draws the texture created in the addFade logic
	drawFade: function() {
		this.drawTexture(this.fadeTexture, [this.gl.viewportWidth, 0.0, 0.0, 0.0, 0.0, -this.gl.viewportHeight, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, -this.gl.viewportWidth / 2 + this.gl.viewportCenterX, this.gl.viewportHeight / 2 + this.gl.viewportCenterY, 0.0, 1.0]);
	}
};
	

console.log("This is inside the sprite class");
