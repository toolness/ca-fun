function DogAgentState(agent, pInst, options) {
  var MIN_DIST_TO_OWNER = 2;
  var MAX_DIST_TO_TREAT = 10;
  var owner = options.owner;
  var treats = options.treats || [];
  var lastOwnerPos;
  var closestTreat;
  var moveCount = 0;
  var searchState = new AgentStateDrunk(agent, pInst);
  var followState = new AgentStateFollow(agent, pInst, {
    getTargetPosition: function() {
      return lastOwnerPos;
    }
  });
  var followTreatState = new AgentStateFollow(agent, pInst, {
    getTargetPosition: function() {
      return closestTreat;
    }
  });
  var getClosestVisibleTreat = function() {
    var dist, inLos, treat, bestTreat;
    var bestDist = Infinity;

    for (var i = 0; i < treats.length; i++) {
      treat = treats[i];
      dist = Math.abs(treat.x - agent.x) + Math.abs(treat.y - agent.y);
      inLoS = Ray.trace(agent.grid, agent.x, agent.y, treat.x, treat.y);
      if (inLoS && dist < bestDist) {
        bestDist = dist;
        bestTreat = treat;
      }
    }

    if (bestDist < MAX_DIST_TO_TREAT)
      return bestTreat;
  };

  return {
    move: function() {
      moveCount++;
      if (moveCount % 2 == 1) return;

      closestTreat = getClosestVisibleTreat();

      if (closestTreat) {
        followTreatState.move();
        if (agent.x == closestTreat.x && agent.y == closestTreat.y) {
          treats.splice(treats.indexOf(closestTreat), 1);
        }
        return;
      }

      var distanceToOwner = Math.abs(owner.x - agent.x) +
                            Math.abs(owner.y - agent.y);
      var inLineOfSight = Ray.trace(agent.grid, agent.x, agent.y,
                                    owner.x, owner.y);
      if (inLineOfSight) {
        if (distanceToOwner > MIN_DIST_TO_OWNER) {
          lastOwnerPos = {x: owner.x, y: owner.y};
        } else {
          lastOwnerPos = null;
        }
      }

      if (lastOwnerPos) {
        followState.move();
        if (!followState.hasPlan()) {
          lastOwnerPos = null;
        }
      } else if (!inLineOfSight) {
        searchState.move();
      }
    }
  }
};
