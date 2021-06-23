//Variables used by the eggs
beamMeUpInterval = null;

//And this is where all (ie, most) of the 'undocumented bonus features' will be triggered!
function checkEgg(text) {
	var eggFound = false;

	//Begin checking for said bonus features
	if(/[Bb]ee?a?m\s+me\s+up,?\s+[Ss][ck]ott?(ie|y)/.exec(text) != null) { beamMeUp(); eggFound = true; }	

	if(/^[Pp][Dd][Pp].*[Ss][p]a(ce)\s*w(a|a)rs?$/.exec(text) != null) { pdp = true; eggFound = true; }

	if(/^pdp.*g(o|ang)\s+(a)way?'?!?$/.exec(text) != null) { pdp = false; eggFound = true; }

	return eggFound;
}

function beamMeUp() {
	if(beamMeUpInterval == null) beamMeUpInterval = setInterval(checkBeam, 50);
}

function checkBeam() {
	//TODO: provide for a better animation
	ship.width /= 1.5;
	ship.height /= 1.5;
	ship.originX /= 1.5;
	ship.originY /= 1.5;
	
	if(ship.width < 1) {
		ship.width = ship.params.width;
		ship.height = ship.params.height;
		ship.originX = ship.params.originX
		ship.originY = ship.params.originY;
		ship.x = Math.random() * UNIVERSE_SIZE - UNIVERSE_SIZE / 2;
		ship.y = Math.random() * UNIVERSE_SIZE - UNIVERSE_SIZE / 2;
		ship.lastX = ship.x;
		ship.lastY = ship.y;
		clearInterval(beamMeUpInterval);
		beamMeUpInterval = null;
	}
}
