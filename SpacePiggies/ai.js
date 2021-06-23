var AI_MAX_SENSING_DISTANCE = 250000;

aiUpdate = function(elapsed) {
	var closestPig = null;
	var closestPigDistance = AI_MAX_SENSING_DISTANCE + 100;

	for(i in pigs) {
		var pig = pigs[i];
		if(pig.isAlive) {
			var dx = (pig.getCenter().x) - (this.getCenter().x);
			var dy = (pig.getCenter().y) - (this.getCenter().y);
			var distanceSquared = dx * dx + dy * dy;
			if(distanceSquared < AI_MAX_SENSING_DISTANCE && distanceSquared / pig.value < closestPigDistance) {
				closestPig = pig;
				closestPigDistance = distanceSquared / pig.value;
			}
		}
	}

	closestPig = ship;
	if ( closestPig != null) {
		var directionToPig = getAbsoluteDirection(Math.atan2(closestPig.getCenter().y - this.getCenter().y, closestPig.getCenter().x - this.getCenter().x) - this.direction);
		
		if( directionToPig > 0) {
			if(directionToPig > this.maxTurn * elapsed / 1000)
				this.direction += this.maxTurn * elapsed / 1000;
			else
				this.direction += directionToPig / 2;
		}
			
		else if ( directionToPig < 0) {
			if (-directionToPig > this.maxTurn * elapsed / 1000)
					this.direction -= this.maxTurn * elapsed / 1000;
			else
				this.direction += directionToPig / 2;
		}
	}

	this.rotation = this.direction;
	//this.fireForwardBlaster(elapsed);
};
