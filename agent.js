function Agent(x, y, col) {
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

  if (!getSquare(newX, newY)) {
    this.x = newX;
    this.y = newY;
  }
};

Agent.prototype.draw = function() {
  if (frameCount % 5 == 0) this.move();
  fill(this.color);
  rect(this.x * SQUARE_SIZE, this.y * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
};

Agent.placeRandomly = function() {
  var x, y, i;

  for (i = 0; i < 1000; i++) {
    x = Math.floor(random(0, WIDTH));
    y = Math.floor(random(0, WIDTH));
    if (!getSquare(x, y)) {
      return new Agent(x, y);
    }
  }
};
