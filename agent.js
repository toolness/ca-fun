function Agent(grid, x, y, col, pInst) {
  this.grid = grid;
  this._pInst = pInst || window;
  this.x = x;
  this.y = y;
  this.color = col || "blue";
  this._state = new AgentStateNull();
}

Agent.prototype.move = function() {
  if (this._state) this._state.move();
};

Agent.prototype.draw = function() {
  if (this._pInst.frameCount % 5 == 0) this.move();
  this.grid.drawSquare(this.x, this.y, this.color);
};

Agent.prototype.setState = function(stateConstructor) {
  this._state = new stateConstructor(this, this._pInst);
};

Agent.placeRandomly = function(grid, col, pInst) {
  var x, y, i;

  pInst = pInst || window;

  for (i = 0; i < 1000; i++) {
    x = Math.floor(pInst.random(0, grid.width));
    y = Math.floor(pInst.random(0, grid.width));
    if (grid.getSquare(x, y) == grid.EMPTY) {
      return new Agent(grid, x, y, col, pInst);
    }
  }
};

function AgentStateNull() {
  return {
    move: function() {}
  };
}

function AgentStateDrunk(agent, pInst) {
  return {
    move: function() {
      var dir = Math.floor(pInst.random(0, 4));
      var newX = agent.x, newY = agent.y;

      if (dir == 0) {
        newX++;
      } else if (dir == 1) {
        newX--;
      } else if (dir == 2) {
        newY++;
      } else {
        newY--;
      }

      if (agent.grid.getSquare(newX, newY) == agent.grid.EMPTY) {
        agent.x = newX;
        agent.y = newY;
      }
    }
  };
}

function AgentStateFollowMouse(agent, pInst) {
  return {
    move: function() {
      var grid = agent.grid;
      var x = agent.x;
      var y = agent.y;

      if (grid.mouseX > x &&
          grid.getSquare(x + 1, y) == grid.EMPTY) {
        agent.x++;
      } else if (grid.mouseX < x &&
                 grid.getSquare(x - 1, y) == grid.EMPTY) {
        agent.x--;
      } else if (grid.mouseY > y &&
                 grid.getSquare(x, y + 1) == grid.EMPTY) {
        agent.y++;
      } else if (grid.mouseY < y &&
                 grid.getSquare(x, y - 1) == grid.EMPTY) {
        agent.y--;
      }
    }
  };
}

function AgentStateFollowMouseWithPlanning(agent, pInst) {
  var grid = agent.grid;
  var goalX = 0;
  var goalY = 0;
  var plan = [];

  function distanceToGoal(x, y) {
    return Math.abs(goalX - x) + Math.abs(goalY - y);
  }

  function makeNewPlan() {
    var plans, bestPlan, nextPlan, exploredSquares;

    function explorePlan(plan) {
      var x, y;

      function exploreSquare(x, y) {
        if (grid.getSquare(x, y) != grid.EMPTY) return;
        if (exploredSquares[x][y]) return;

        exploredSquares[x][y] = true;
        plans.push({
          minDistanceToGoal: distanceToGoal(x, y),
          path: plan.path.concat({x: x, y: y})
        });
      }

      if (plan.path.length == 0) {
        x = agent.x;
        y = agent.y;
      } else {
        x = plan.path[plan.path.length-1].x;
        y = plan.path[plan.path.length-1].y;
      }

      if (x < grid.width - 1) exploreSquare(x + 1, y);
      if (x > 0) exploreSquare(x - 1, y);
      if (y < grid.width - 1) exploreSquare(x, y + 1);
      if (y > 0) exploreSquare(x, y - 1);
    }

    goalX = grid.mouseX;
    goalY = grid.mouseY;

    plans = [{
      minDistanceToGoal: distanceToGoal(agent.x, agent.y),
      path: []
    }];

    bestPlan = plans[0];
    exploredSquares = [];
    for (var i = 0; i < grid.width; i++) {
      exploredSquares.push([]);
      for (var j = 0; j < grid.width; j++) {
        exploredSquares[i].push(false);
      }
    }

    while (plans.length) {
      // Ideally we'd use a priority queue here.
      plans.sort(function(a, b) {
        var totalA = a.path.length + a.minDistanceToGoal;
        var totalB = b.path.length + b.minDistanceToGoal;

        return totalA - totalB;
      });

      nextPlan = plans.shift();

      if (bestPlan.minDistanceToGoal > nextPlan.minDistanceToGoal) {
        bestPlan = nextPlan;
        if (bestPlan.minDistanceToGoal == 0) {
          break;
        }
      }
      explorePlan(nextPlan);
    }

    plan = bestPlan.path;
  }

  function continueFollowingPlan() {
    var coord;

    if (plan.length == 0) return;

    coord = plan.shift();
    agent.x = coord.x;
    agent.y = coord.y;
  }

  makeNewPlan();

  return {
    move: function() {
      if (grid.mouseX === undefined) return;
      if (goalX != grid.mouseX || goalY != grid.mouseY)
        makeNewPlan();
      continueFollowingPlan();
    }
  };
}
