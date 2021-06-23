function Laser(direction, offsetX, offsetY) {
	this.direction = direction;
	this.offsetX = offsetX!==undefined?offsetX:0;
	this.offsetY = offsetY!==undefined?offsetY:0;
}

var shipParams = {
	aiShip: {
		maxSpeed: 250,
		maxTurn: Math.PI * 0.8,

		width: 32,
		height: 32,
		originX: 14,
		originY: 16.5,
		
		maxHealth: 150,

		_texture: undefined,
		_textureURL: "Images/tinyShip.png",
		
		getTexture: function(sb) {
			if(this._texture === undefined && sb !== undefined) {
				this._texture = sb.loadTexture(this._textureURL);
			}
			
			return this._texture;
		},
		
		forwardBlaster: {
			fireRate: 150,
			lasers: [ new Laser(0, 16, 0) ]
		},

		sternchaser: {
			lasers: [ ]
		},

		broadsides: {
			lasers: [ ]
		}
	},

	defaultShip: {
		maxSpeed: 400,
		maxTurn: Math.PI,
		
		width: 64,
		height: 32,
		originX: 30,
		originY: 15.5,

		maxHealth: 750,
		
		_texture: undefined,
		_textureURL: "Images/defaultShip.png",
		
		getTexture: function(sb) {
			if(this._texture === undefined && sb !== undefined) {
				this._texture = sb.loadTexture(this._textureURL);
			}
			
			return this._texture;
		},
		
		forwardBlaster: {
			fireRate: 25,
			lasers: [
				new Laser(0, 5, 12),
				new Laser(0, 5, -12)
			]
		},

		sternchaser: {
			fireRate: 100,
			lasers: [  new Laser(Math.PI, -30, 0) ]
		},

		broadsides: {
			fireRate: 250,
			lasers: [
				new Laser(Math.PI / 2 + 0.050, -2, 16),
				new Laser(Math.PI / 2 + 0.025, -1, 16),
				new Laser(Math.PI / 2 + 0.000,  0, 16),
				new Laser(Math.PI / 2 - 0.025,  1, 16),
				new Laser(Math.PI / 2 - 0.050,  2, 16)
			]
		}
	},
	
	fastShip: {
		maxSpeed: 600,
		maxTurn: Math.PI * 1.2,
		
		width: 32,
		height: 32,
		originX: 14,
		originY: 16,

		maxHealth: 600,
		
		_texture: null,
		_textureURL: "Images/ship1.png",
		
		getTexture: function(sb) {
			if(this._texture === null && sb !== undefined) {
				this._texture = sb.loadTexture(this._textureURL);
			}
			
			return this._texture;
		},
		
		forwardBlaster: {
			fireRate: 20,
			lasers: [ new Laser(0, 18, 0) ]
		},

		sternchaser: {
			fireRate: 150,
			lasers: [ new Laser(Math.PI, -18, 0) ]
		},

		broadsides: {
			fireRate: 150,
			lasers: [
				new Laser(Math.PI / 2 - 0.31,  10, 18),
				new Laser(Math.PI / 2 - 0.30,  10, 18)
			]
		}
	}
};


