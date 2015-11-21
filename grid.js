function Grid(options) {
  this.width = options.width;
  this.viewportWidth = options.viewportWidth || this.width;
  this.viewportTop = 0;
  this.viewportLeft = 0;
  this.edgeValue = options.edgeValue;
  this.squareSize = options.squareSize;
  this.showGrid = options.showGrid;
  this.filledColor = options.filledColor || 'white';
  this.emptyColor = options.emptyColor || 'black';
  this.pixelWidth = this.viewportWidth * this.squareSize;
  this._pInst = options.pInst || window;
  this._lastMouseX = undefined;
  this._lastMouseY = undefined;
  this._drawnSquares = [];

  if (this.showGrid === undefined) this.showGrid = true;
  if (this.showGrid) this.pixelWidth++;

  Object.defineProperties(this, {
    mouseX: {
      get: function() {
        var x = this._lastMouseX;
        var leftOfs = this.viewportLeft * this.squareSize;

        if (this._pInst.mouseIsPressed) {
          x = this._pInst.mouseX + leftOfs;
        } else if (this._pInst.touchIsDown) {
          x = this._pInst.touchX + leftOfs;
        } else if (x === undefined) {
          return x;
        }

        this._lastMouseX = x;
        return Math.floor(x / this.squareSize);
      }
    },
    mouseY: {
      get: function() {
        var y = this._lastMouseY;
        var topOfs = this.viewportTop * this.squareSize;

        if (this._pInst.mouseIsPressed) {
          y = this._pInst.mouseY + topOfs;
        } else if (this._pInst.touchIsDown) {
          y = this._pInst.touchY + topOfs;
        } else if (y === undefined) {
          return y;
        }

        this._lastMouseY = y;
        return Math.floor(y / this.squareSize);
      }
    }
  });

  this.clear();
}

Grid.EMPTY = Grid.prototype.EMPTY = 0;

Grid.FILLED = Grid.prototype.FILLED = 1;

Grid.prototype.getSquare = function(x, y) {
  var w = this.width;
  return this._grid[(w + x) % w][(w + y) % w];
};

Grid.prototype.setSquare = function(x, y, value) {
  if (this._grid[x][y] !== value) {
    this._grid[x][y] = value;
    this._drawnSquares.push({x: x, y: y});
  }
};

Grid.prototype.clear = function() {
  var grid = [];

  for (var i = 0; i < this.width; i++) {
    grid.push([]);
    for (var j = 0; j < this.width; j++) {
      grid[i].push(this.EMPTY);
    }
  }

  this._grid = grid;
  this._needsFullRedraw = true;
};

Grid.prototype.createCanvas = function() {
  this._pInst.createCanvas(this.pixelWidth, this.pixelWidth);
};

Grid.prototype.resizeCanvas = function() {
  this._pInst.resizeCanvas(this.pixelWidth, this.pixelWidth);
};

Grid.prototype.createRandom = function() {
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

  this._grid = grid;
  this._needsFullRedraw = true;
};

Grid.prototype._connectOneGroup = function(groups, groupEdges) {
  var explored = [];
  var myGroup = groupEdges.sort(function(a, b) {
    return a.edges.length - b.edges.length;
  })[0];
  var visitSquare = function(x, y, basePath) {
    if (explored[x][y]) return;
    if (groups[x][y] === myGroup.id) return;
    explored[x][y] = true;
    paths.push(basePath.concat([[x, y]]));
  };
  var grid = this._grid;
  var paths = myGroup.edges.map(function(coord) {
    return [coord];
  });
  var path;
  var x, y;

  for (var i = 0; i < this.width; i++) {
    explored.push([]);
    for (var j = 0; j < this.width; j++) {
      explored[i].push(false);
    }
  }

  myGroup.edges.forEach(function(coord) {
    explored[coord[0]][coord[1]] = true;
  });

  while (paths.length) {
    path = paths.shift();
    x = path[path.length - 1][0];
    y = path[path.length - 1][1];
    if (grid[x][y] === this.EMPTY && groups[x][y] !== myGroup.id) {
      path.slice(0, -1).forEach(function(coord) {
        this.setSquare(coord[0], coord[1], this.EMPTY);
      }, this);
      return;
    }
    if (x > 0) visitSquare(x - 1, y, path);
    if (x < this.width - 1) visitSquare(x + 1, y, path);
    if (y > 0) visitSquare(x, y - 1, path);
    if (y < this.width - 1) visitSquare(x, y + 1, path);
  }
};

Grid.prototype.makeWellConnected = function() {
  var self = this;
  var grid = this._grid;
  var groups = [];
  var groupEdges = [];
  var numGroups = 0;
  var i, j;
  var needsGroupId = function(x, y) {
    return grid[x][y] === self.EMPTY && groups[x][y] === undefined;
  };
  var explore = function(x, y, groupId) {
    var visitQueue = [{x: x, y: y}];
    var visitSquare = function(x, y) {
      if (needsGroupId(x, y)) {
        groups[x][y] = groupId;
        visitQueue.push({x: x, y: y});
      } else if (grid[x][y] === self.FILLED) {
        groupEdges[groupId].edges.push([x, y]);
      }
    };

    groups[x][y] = groupId;
    while (visitQueue.length) {
      var coord = visitQueue.shift();
      x = coord.x;
      y = coord.y;

      if (x > 0) visitSquare(x - 1, y);
      if (x < self.width - 1) visitSquare(x + 1, y);
      if (y > 0) visitSquare(x, y - 1);
      if (y < self.width - 1) visitSquare(x, y + 1);
    }
  };

  for (i = 0; i < this.width; i++) {
    groups.push([]);
    for (j = 0; j < this.width; j++) {
      groups[i].push(undefined);
    }
  }

  for (i = 0; i < this.width; i++) {
    for (j = 0; j < this.width; j++) {
      if (needsGroupId(i, j)) {
        groupEdges.push({id: numGroups, edges: []});
        explore(i, j, numGroups++);
      }
    }
  }

  if (numGroups > 1) {
    this._connectOneGroup(groups, groupEdges);
    this.makeWellConnected();
  }
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
  this._needsFullRedraw = true;
};

Grid.prototype.setViewportTopLeft = function(top, left) {
  if (top + this.viewportWidth > this.width) {
    top = this.width - this.viewportWidth;
  }
  if (left + this.viewportWidth > this.width) {
    left = this.width - this.viewportWidth;
  }
  if (top < 0) top = 0;
  if (left < 0) left = 0;

  if (top === this.viewportTop && left === this.viewportLeft) return;

  this.viewportTop = top;
  this.viewportLeft = left;
  this._needsFullRedraw = true;
};

Grid.prototype.drawSquare = function(x, y, col) {
  this._drawnSquares.push({x: x, y: y});
  this._drawSquare(x, y, col);
};

Grid.prototype._drawSquare = function(x, y, col) {
  x -= this.viewportLeft;
  y -= this.viewportTop;

  if (x < 0 || x >= this.viewportWidth ||
      y < 0 || y >= this.viewportWidth) {
    return;
  }

  this._pInst.fill(col);
  if (this.showGrid) {
    this._pInst.strokeWeight(1);
    this._pInst.stroke(0, 0, 0);
  } else {
    this._pInst.noStroke();
  }
  this._pInst.rect(x * this.squareSize, y * this.squareSize,
                   this.squareSize, this.squareSize);
};

Grid.prototype._drawBaseSquare = function(x, y) {
  var col;

  if (this._grid[x][y] == this.FILLED) {
    col = this._pInst.color(this.filledColor);
  } else {
    col = this._pInst.color(this.emptyColor);
  }
  this._drawSquare(x, y, col);
};

Grid.prototype._drawComplete = function() {
  var top = this.viewportTop;
  var left = this.viewportLeft;
  for (var i = left; i < left + this.viewportWidth; i++) {
    for (var j = top; j < top + this.viewportWidth; j++) {
      this._drawBaseSquare(i, j);
    }
  }
};

Grid.prototype.draw = function() {
  if (this._needsFullRedraw) {
    this._drawComplete();
    this._needsFullRedraw = false;
  } else {
    this._drawnSquares.forEach(function(square) {
      this._drawBaseSquare(square.x, square.y);
    }, this);
    this._drawnSquares = [];
  }
};
