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
  var sqSize = this.grid.squareSize;

  if (this._pInst.frameCount % 5 == 0) this.move();
  this._pInst.fill(this.color);
  this._pInst.rect(this.x * sqSize, this.y * sqSize, sqSize, sqSize);
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
