var mouseColor = 195;

Blockly.defineBlocksWithJsonArray([
{
	type: "is_left_mouse_pressed",
	message0: "left mouse key is pressed?",
	args0: [],
	output: "Boolean",
	colour: mouseColor
},

{
	type: "is_center_mouse_pressed",
	message0: "center mouse key is pressed?",
	args0: [],
	output: "Boolean",
	colour: mouseColor
},

{
	type: "is_right_mouse_pressed",
	message0: "right mouse key is pressed?",
	args0: [],
	output: "Boolean",
	colour: mouseColor
},

{
	type: "mouse_x",
	message0: "get mouse X",
	args0: [],
	output: "Number",
	colour: mouseColor
},

{
	type: "mouse_y",
	message0: "get mouse Y",
	args0: [],
	output: "Number",
	colour: mouseColor
},

{
	type: "mouse_wheel",
	message0: "get mouse scroll wheel value",
	output: "Number",
	colour: mouseColor
},

{
	type: "direction_to_mouse",
	message0: "direction to mouse",
	output: "Number",
	colour: mouseColor,
	tooltip: "Gets the direction from the space ship to the mouse pointer, relative to the direction that the space ship is pointing."
} 
]);

Blockly.JavaScript["is_left_mouse_pressed"] = function(block) {
	return ["currentMouse.left", Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript["is_right_mouse_pressed"] = function(block) {
	return ["currentMouse.right", Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript["is_center_mouse_pressed"] = function(block) {
	return ["currentMouse.center", Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript["mouse_x"] = function(block) {
	return ["currentMouse.x", Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript["mouse_y"] = function(block) {
	return ["currentMouse.y", Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript["mouse_wheel"] = function(block) {
	return ["currentMouse.wheel", Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript["direction_to_mouse"] = function(block) {
	return ["(getAbsoluteDirection(Math.atan2(currentMouse.y - spriteBatch.gl.viewportHeight / 2, currentMouse.x- spriteBatch.gl.viewportWidth / 2) - ship.rotation) * 180 / Math.PI)", Blockly.JavaScript.ORDER_ATOMIC];
};

