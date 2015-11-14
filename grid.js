function Grid(options) {
  this.width = options.width;
  this.edgeValue = options.edgeValue;
  this.squareSize = options.squareSize;
  this._pInst = options.pInst || window;
  this._grid = this._createRandom();
  this._lastMouseX = 0;
  this._lastMouseY = 0;

  Object.defineProperties(this, {
    mouseX: {
      get: function() {
        var x = this._lastMouseX;

        if (this._pInst.mouseIsPressed) {
          x = this._pInst.mouseX;
        } else if (this._pInst.touchIsDown) {
          x = this._pInst.touchX;
        }
        this._lastMouseX = x;
        return Math.floor(x / this.squareSize);
      }
    },
    mouseY: {
      get: function() {
        var y = this._lastMouseY;

        if (this._pInst.mouseIsPressed) {
          y = this._pInst.mouseY;
        } else if (this._pInst.touchIsDown) {
          y = this._pInst.touchY;
        }
        this._lastMouseY = y;
        return Math.floor(y / this.squareSize);
      }
    }
  });
}

Grid.EMPTY = Grid.prototype.EMPTY = 0;

Grid.FILLED = Grid.prototype.FILLED = 1;

Grid.prototype.getSquare = function(x, y) {
  var w = this.width;
  return this._grid[(w + x) % w][(w + y) % w];
};

Grid.prototype._createRandom = function(edgeValue) {
  var grid = [];

  for (var i = 0; i < this.width; i++) {
    grid.push([]);
    for (var j = 0; j < this.width; j++) {
      if (typeof(this.edgeValue) == 'number' && 
          (i == 0 || j == 0 || i == this.width - 1 || j == this.width - 1)) {
        grid[i].push(this.edgeValue);
      } else {
        grid[i].push(this._pInst.random() > 0.5 ? this.FILLED : this.EMPTY);
      }
    }
  }

  return grid;
};

Grid.prototype.smooth = function(threshold) {
  var sum;
  var newGrid = [];

  for (var i = 0; i < this.width; i++) {
    newGrid.push([]);
    for (var j = 0; j < this.width; j++) {
      sum = [
        this.getSquare(i - 1, j - 1), // top-left
        this.getSquare(i, j - 1),     // top
        this.getSquare(i + 1, j - 1), // top-right
        this.getSquare(i - 1, j),     // left
        this.getSquare(i + 1, j),     // right
        this.getSquare(i - 1, j + 1), // bottom-left
        this.getSquare(i, j + 1),     // bottom
        this.getSquare(i + 1, j + 1)  // bottom-right
      ].reduce(function(prev, value) { return prev + value; }, 0);
      if ((sum / 8) > threshold) {
        newGrid[i].push(this.FILLED);
      } else {
        newGrid[i].push(this.EMPTY);
      }
    }
  }

  this._grid = newGrid;
};

Grid.prototype.draw = function() {
  var col;

  for (var i = 0; i < WIDTH; i++) {
    for (var j = 0; j < WIDTH; j++) {
      if (this._grid[i][j] == this.FILLED) {
        col = this._pInst.color(255, 255, 255);
      } else {
        col = this._pInst.color(0, 0, 0);
      }
      fill(col);
      this._pInst.rect(i * this.squareSize, j * this.squareSize,
                       this.squareSize, this.squareSize);
    }
  }
};
