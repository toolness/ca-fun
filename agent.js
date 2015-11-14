function Agent(grid, pInst, x, y, col) {
  this.grid = grid;
  this._pInst = pInst || window;
  this.x = x;
  this.y = y;
  this.color = col || "blue";
}

Agent.prototype.move = function() {
  var dir = Math.floor(this._pInst.random(0, 4));
  var newX = this.x, newY = this.y;

  if (dir == 0) {
    newX++;
  } else if (dir == 1) {
    newX--;
  } else if (dir == 2) {
    newY++;
  } else {
    newY--;
  }

  if (this.grid.getSquare(newX, newY) == this.grid.EMPTY) {
    this.x = newX;
    this.y = newY;
  }
};

Agent.prototype.draw = function() {
  var sqSize = this.grid.squareSize;

  if (this._pInst.frameCount % 5 == 0) this.move();
  this._pInst.fill(this.color);
  this._pInst.rect(this.x * sqSize, this.y * sqSize, sqSize, sqSize);
};

Agent.placeRandomly = function(grid, pInst) {
  var x, y, i;

  pInst = pInst || window;

  for (i = 0; i < 1000; i++) {
    x = Math.floor(pInst.random(0, grid.width));
    y = Math.floor(pInst.random(0, grid.width));
    if (grid.getSquare(x, y) == grid.EMPTY) {
      return new Agent(grid, pInst, x, y);
    }
  }
};
