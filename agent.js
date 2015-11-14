function Agent(grid, x, y, col) {
  this.grid = grid;
  this.x = x;
  this.y = y;
  this.color = col || "blue";
}

Agent.prototype.move = function() {
  var dir = Math.floor(random(0, 4));
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

  if (frameCount % 5 == 0) this.move();
  fill(this.color);
  rect(this.x * sqSize, this.y * sqSize, sqSize, sqSize);
};

Agent.placeRandomly = function(grid) {
  var x, y, i;

  for (i = 0; i < 1000; i++) {
    x = Math.floor(random(0, grid.width));
    y = Math.floor(random(0, grid.width));
    if (grid.getSquare(x, y) == grid.EMPTY) {
      return new Agent(grid, x, y);
    }
  }
};
