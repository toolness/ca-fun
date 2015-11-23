function AgentStateStayAwayFrom(agent, pInst, options) {
  options = options || {};

  var DEFAULT_MIN_DIST_FROM_TARGET = 10;
  var getTargetPosition = options.getTargetPosition || function() {
    return {x: agent.grid.mouseX, y: agent.grid.mouseY};
  };
  var minDist = options.distance || DEFAULT_MIN_DIST_FROM_TARGET;
  var grid = agent.grid;

  return {
    move: function() {
      var target = getTargetPosition();
      if (!target || target.x === undefined) return;
      var dist = Math.abs(target.x - agent.x) +
                 Math.abs(target.y - agent.y);
      var x = agent.x;
      var y = agent.y;
      var moves = [];
      var move;

      if (dist >= minDist) return false;

      if (target.x >= x && x > 0 &&
          grid.getSquare(x - 1, y) == grid.EMPTY) {
        moves.push({x: -1, y: 0});
      } else if (target.x <= x && x < grid.width - 1 &&
                 grid.getSquare(x + 1, y) == grid.EMPTY) {
        moves.push({x: 1, y: 0});
      }

      if (target.y >= y && y > 0 &&
          grid.getSquare(x, y - 1) == grid.EMPTY) {
        moves.push({x: 0, y: -1});
      } else if (target.y <= y && y < grid.width - 1 &&
                 grid.getSquare(x, y + 1) == grid.EMPTY) {
        moves.push({x: 0, y: 1});
      }

      if (moves.length) {
        move = moves[Math.floor(pInst.random(moves.length))];
        agent.x += move.x;
        agent.y += move.y;
        return true;
      }

      return false;
    }
  };
}

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
  var fearState = new AgentStateStayAwayFrom(agent, pInst, {
    getTargetPosition: function() {
      return {x: options.stayAwayFrom.x, y: options.stayAwayFrom.y};
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

      if (fearState.move()) return;

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
