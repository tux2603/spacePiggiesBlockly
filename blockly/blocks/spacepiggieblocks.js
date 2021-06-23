Blockly.defineBlocksWithJsonArray([{
	"type": "move",
	"message0": "move %1",
	"args0": [ {
		"type": "field_dropdown",
		"name": "DIRECTION",
		"options": [ ["Forward", "f"], ["Backward", "b"] ]
	} ],
	"inputsInline": true,
	"previousStatement": null,
	"nextStatement": null,
	"colour": 230,
	"tooltip": "",
	"helpUrl": ""
},

{
	"type": "turn",
	"message0": "Turn %1",
	"args0": [
		{
			"type": "field_dropdown",
			"name": "DIRECTION",
			"options": [
				[
					"Left ↺",
					"l"
				],
				[
					"Right ↻",
					"r"
				]
			]
		}	 
	],
	"inputsInline": true,
	"previousStatement": null,
	"nextStatement": null,
	"colour": 230,
	"tooltip": "",
	"helpUrl": ""
}, 

{
	"type": "turn_rate",
	"message0": "Turn %1 at %2 degrees per second",
	"args0": [
		{
			"type": "field_dropdown",
			"name": "DIRECTION",
			"options": [
				[
					"Left ↺",
					"l"
				],
				[
					"Right ↻",
					"r"
				]
			]
		},
	 {
			"type": "input_value",
			"name": "SPEED",
			"check": "Number"
		}
	],
	"inputsInline": true,
	"previousStatement": null,
	"nextStatement": null,
	"colour": 230,
	"tooltip": "",
	"helpUrl": ""
}, 

{
	"type": "set_speed_percent",
	"message0": "Set speed to %1%% of maximum speed",
	"args0": [ {
		"type": "input_value",
		"name": "SPEED",
		"check": "Number"
	} ],
	"inputsInline": true,
		"previousStatement": null,
		"nextStatement": null,
		"colour": 230,
		"tooltip": "",
		"helpUrl": ""
}, 

{
	"type": "set_speed_absolute",
	"message0": "Set speed to %1 pixels per second",
	"args0": [ {
		"type": "input_value",
		"name": "SPEED",
		"check": "Number"
	} ],
	"inputsInline": true,
		"previousStatement": null,
		"nextStatement": null,
		"colour": 230,
		"tooltip": "",
		"helpUrl": ""
}, 

{
	"type": "accel",
	"message0": "Increase speed by %1 pixels per second",
	"args0": [
		{
			"type": "input_value",
			"name": "SPEED",
			"check": "Number"
		}
	],
	"inputsInline": true,
	"previousStatement": null,
	"nextStatement": null,
	"colour": 230,
	"tooltip": "",
	"helpUrl": ""
}, 

{
	"type": "stop",
	"message0": "Stop",
	"inputsInline": true,
	"previousStatement": null,
	"nextStatement": null,
	"colour": 230,
	"tooltip": "",
	"helpUrl": ""
}, 

{
	type: "user_update",
	message0: "Game Control Loop, using %1 %2 do %3",
	args0: [
		{
			type: "field_dropdown",
			name: "SHIP_TYPE",
			options: [ ["Basic Space Ship", "BASIC"], ["Fast Space Ship", "FAST"] ]
		},
		
		{
			type: "input_dummy"
		},
		
		{
			type: "input_statement",
			name: "DO"
		}
	],
	colour: 120,
	tooltip: "Do some statements that will control how the game works",
	helpUrl: ""
},

{
	type: "get_ship_direction",
	message0: "direction that the ship is pointing",
	args0: [],
	output: "Number",
	colour: 230
},

{
	type: "log_output",
	message0: "output %1",
	args0: [ {
		"type": "input_value",
		"name": "TEXT"
	} ],
	previousStatement: null,
	nextStatement: null,
	colour: 160
},

{
	type: "set_ship_color",
	message0: "Set space ship color to %1",
	args0: [ {
		type: "input_value",
		name: "COLOR",
		check: "Colour"
	} ],
	inputsInline: true,
	previousStatement: null,
	nextStatement: null,
	colour: 20,
	tooltip: "Sets the color of the space ship. This will have no effect on the performance or speed of the ship. It just looks cool.",
	helpUrl: "",
	colour: 20
},

{
	type: "fire_forward_blaster",
	message0: "Fire forward blaster",
	previousStatement: null,
	nextStatement: null,	
	tooltip: "",
	helpUrl: "",
	colour: 0
},

{
	type: "fire_sternchaser",
	message0: "Fire sternchaser",
	previousStatement: null,
	nextStatement: null,	
	tooltip: "Fires a laser (or lasers) out of the back of the space ship",
	helpUrl: "",
	colour: 0
},

{
	type: "fire_port_broadside",
	message0: "Fire port broadside",
	previousStatement: null,
	nextStatement: null,	
	tooltip: "Fires a whole slew of lasers out of the port (left) side of the space ship",
	helpUrl: "",
	colour: 0
},

{
	type: "fire_starboard_broadside",
	message0: "Fire starboard broadside",
	previousStatement: null,
	nextStatement: null,	
	tooltip: "Fires a whole slew of lasers out of the starboard (right) side of the space ship",
	helpUrl: "",
	colour: 0
},

{
	type: "nearest_pig",
	message0: "Nearest Pig",
	output: "Sprite",
	colour: null
},

{
	type: "pig_number",
	message0: "Pig Number %1",
	args0: [{
		type: "input_value",
		name: "INDEX",
		check: "Number"
	} ],
	"inputsInline": true,
	output: "Sprite",
	colour: null
},

{
	type: "nearest_ai",
	message0: "Nearest AI",
	output: "Sprite",
	colour: null
},

{
	type: "ai_number",
	message0: "AI Number %1",
	args0: [{
		type: "input_value",
		name: "INDEX",
		check: "Number"
	} ],
	"inputsInline": true,
	output: "Sprite",
	colour: null
},

{
	type: "direction_to",
	message0: "Direction to %1",
	args0: [ {
		"type": "input_value",
		"name": "SPRITE",
		"check": "Sprite"
	} ],
	output: "Number",
	colour: null
},

{
	type: "distance_to",
	message0: "Distance to %1",
	args0: [ {
		"type": "input_value",
		"name": "SPRITE",
		"check": "Sprite"
	} ],
	output: "Number",
	colour: null
}

]);

Blockly.JavaScript['move'] = function(block) {
	var direction = block.getFieldValue('DIRECTION');
	var speed = direction=="f"?0.75:-0.75;
	var code = "ship.x += ship.maxSpeed * " + speed + " * Math.cos(ship.direction) * (elapsed / 1000);\n";
	code += "ship.y += ship.maxSpeed * " + speed + " * Math.sin(ship.direction) * (elapsed / 1000);\n";
	return code;
};

Blockly.JavaScript['turn'] = function(block) {
	var direction = block.getFieldValue('DIRECTION');
	var code = "turnShip(\"" + direction + "\", ship.maxTurn / 2, elapsed);\n";
	return code;
};

Blockly.JavaScript['turn_rate'] = function(block) {
	var direction = block.getFieldValue('DIRECTION');
	//Convert the speed, which was entered in degrees/s to radians/s
	var speed = Blockly.JavaScript.valueToCode(block, 'SPEED', Blockly.JavaScript.ORDER_ATOMIC);
	var code = "turnShip(\"" + direction + "\", (" + speed + ") * Math.PI / 180, elapsed);\n";
	return code;
};

Blockly.JavaScript['set_speed_percent'] = function(block) {
	var speed = Blockly.JavaScript.valueToCode(block, 'SPEED', Blockly.JavaScript.ORDER_ATOMIC);
	var code = "ship.speed = " + speed + " * ship.maxSpeed / 100;\n" + "ship.clampSpeed();\n";
	return code;
};

Blockly.JavaScript['set_speed_absolute'] = function(block) {
	var speed = Blockly.JavaScript.valueToCode(block, 'SPEED', Blockly.JavaScript.ORDER_ATOMIC);
	var code = "ship.speed = " + speed + ";\n" + "ship.clampSpeed();\n";
	return code;
};

Blockly.JavaScript['accel'] = function(block) {
	var speed = Blockly.JavaScript.valueToCode(block, 'SPEED', Blockly.JavaScript.ORDER_ATOMIC);
	var code = "ship.accelerate(elapsed, " + speed + ");\n";
	return code;
};

Blockly.JavaScript['stop'] = function(block) {
	var code = "ship.speed = 0;\n";
	return code;
};

Blockly.JavaScript['user_update'] = function(block) {
	var shipType = block.getFieldValue('SHIP_TYPE');
	var statements = Blockly.JavaScript.statementToCode(block, 'DO');
	var code = "ship.setParams(";
	if(shipType == "BASIC") code += "shipParams.basicShip";
	if(shipType == "FAST") code += "shipParams.fastShip";
	code += ");\nuserUpdate = function(elapsed) {\n\t" + statements + "\n};";
	return code;
};

Blockly.JavaScript['get_ship_direction'] = function(block) {
	return ["(getAbsoluteDirection(ship.direction) * 180 / Math.PI)", Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['log_output'] = function(block) {
	var text = Blockly.JavaScript.valueToCode(block, 'TEXT', Blockly.JavaScript.ORDER_ATOMIC);
	
	var code = "logOutput(" + text + ");\n";
	return code;
};

Blockly.JavaScript['set_ship_color'] = function(block) {
	var color = Blockly.JavaScript.valueToCode(block, 'COLOR', Blockly.JavaScript.ORDER_ATOMIC);
	var code = "ship.setColor(" + color + ");\n";
	return code;
};

Blockly.JavaScript['fire_forward_blaster'] = function(block) {
	return "ship.fireForwardBlaster(elapsed);\n";
};

Blockly.JavaScript['fire_sternchaser'] = function(block) {
	return "ship.fireSternchaser(elapsed);\n";
};

Blockly.JavaScript['fire_port_broadside'] = function(block) {
	return "ship.firePortBroadside(elapsed);\n";
};

Blockly.JavaScript['fire_starboard_broadside'] = function(block) {
	return "ship.fireStarboardBroadside(elapsed);\n";
};

Blockly.JavaScript['nearest_pig'] = function(block) {
	return ["nearestPig", Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['pig_number'] = function(block) {
	var index = Blockly.JavaScript.valueToCode(block, 'INDEX', Blockly.JavaScript.ORDER_ATOMIC);
	index = Math.max(1, Math.min(pigs.length, index)) - 1;
	return ["pigs[" + index + "]", Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['nearest_ai'] = function(block) {
	return ["nearestAi", Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['ai_number'] = function(block) {
	var index = Blockly.JavaScript.valueToCode(block, 'INDEX', Blockly.JavaScript.ORDER_ATOMIC);
	index = Math.max(1, Math.min(pigs.length, index)) - 1;
	return ["ais[" + index + "]", Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['direction_to'] = function(block) {
	var otherSprite = Blockly.JavaScript.valueToCode(block, 'SPRITE', Blockly.JavaScript.ORDER_ATOMIC);
	var code = "getDirectionTo(" + otherSprite + ") * 180 / Math.PI";
	return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['distance_to'] = function(block) {
	var otherSprite = Blockly.JavaScript.valueToCode(block, 'SPRITE', Blockly.JavaScript.ORDER_ATOMIC);
	var code = "getDistanceTo(" + otherSprite + ")";
	return [code, Blockly.JavaScript.ORDER_ATOMIC];
};
