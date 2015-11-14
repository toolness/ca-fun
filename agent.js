function Agent(grid, x, y, col, pInst) {
  this.grid = grid;
  this._pInst = pInst || window;
  this.x = x;
  this.y = y;
  this.color = col || "blue";
  this.state = null;
}

Agent.prototype.move = function() {
  if (this.state) this.state.move(this, this._pInst);
};

Agent.prototype.draw = function() {
  var sqSize = this.grid.squareSize;

  if (this._pInst.frameCount % 5 == 0) this.move();
  this._pInst.fill(this.color);
  this._pInst.rect(this.x * sqSize, this.y * sqSize, sqSize, sqSize);
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

function AgentStateDrunk() {}

AgentStateDrunk.prototype.move = function(agent, pInst) {
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
};

function AgentStateFollowMouse() {}

AgentStateFollowMouse.prototype.move = function(agent, pInst) {
  var newX = agent.x, newY = agent.y;

  if (agent.grid.mouseX > agent.x) {
    newX++;
  } else if (agent.grid.mouseX < agent.x) {
    newX--;
  } else if (agent.grid.mouseY > agent.y) {
    newY++;
  } else if (agent.grid.mouseY < agent.y) {
    newY--;
  }

  if (agent.grid.getSquare(newX, newY) == agent.grid.EMPTY) {
    agent.x = newX;
    agent.y = newY;
  }
};
