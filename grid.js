function Grid(options) {
  this.width = options.width;
  this.edgeValue = options.edgeValue;
  this.squareSize = options.squareSize;
  this._pInst = options.pInst || window;
  this._lastMouseX = 0;
  this._lastMouseY = 0;
  this._drawnSquares = [];

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
  this._pInst.createCanvas(this.width * this.squareSize,
                           this.width * this.squareSize);
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
  var visitSquare = function(x, y, groupId) {
    if (needsGroupId(x, y)) {
      explore(x, y, groupId);
    } else if (grid[x][y] === self.FILLED) {
      groupEdges[groupId].edges.push([x, y]);
    }
  };
  var explore = function(x, y, groupId) {
    groups[x][y] = groupId;
    if (x > 0) visitSquare(x - 1, y, groupId);
    if (x < self.width - 1) visitSquare(x + 1, y, groupId);
    if (y > 0) visitSquare(x, y - 1, groupId);
    if (y < self.width - 1) visitSquare(x, y + 1, groupId);
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

Grid.prototype.drawSquare = function(x, y, col) {
  this._drawnSquares.push({x: x, y: y});
  this._drawSquare(x, y, col);
};

Grid.prototype._drawSquare = function(x, y, col) {
  this._pInst.fill(col);
  this._pInst.rect(x * this.squareSize, y * this.squareSize,
                   this.squareSize, this.squareSize);
};

Grid.prototype._drawBaseSquare = function(x, y) {
  var col;

  if (this._grid[x][y] == this.FILLED) {
    col = this._pInst.color(255, 255, 255);
  } else {
    col = this._pInst.color(0, 0, 0);
  }
  this._drawSquare(x, y, col);
};

Grid.prototype._drawComplete = function() {
  for (var i = 0; i < this.width; i++) {
    for (var j = 0; j < this.width; j++) {
      this._drawBaseSquare(i, j);
    }
  }
};

Grid.prototype.draw = function() {
  if (this._needsFullRedraw) {
    console.log("FULL REDRAW");
    this._drawComplete();
    this._needsFullRedraw = false;
  } else {
    this._drawnSquares.forEach(function(square) {
      this._drawBaseSquare(square.x, square.y);
    }, this);
    this._drawnSquares = [];
  }
};
