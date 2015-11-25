function WallGrid(width) {
  var cells = [];
  var self = {
    cells: cells,
    width: width,
    toGrid: function(grid, cellWidth) {
      self.draw(cellWidth, function(x1, y1, x2, y2) {
        var i;

        if (y1 == y2) {
          // It's a horizontal line.
          for (i = x1; i < x2; i++) {
            grid.setSquare(i, y1, grid.FILLED);
          }
        } else {
          // It's a vertical line.
          for (i = y1; i < y2; i++) {
            grid.setSquare(x1, i, grid.FILLED);
          }
        }
      });
    },
    draw: function(cellWidth, line) {
      line = line || window.line;

      for (var i = 0; i < width; i++) {
        for (var j = 0; j < width; j++) {
          var cell = cells[i][j];
          if (cell.top) {
            line(i * cellWidth,
                 j * cellWidth,
                 (i + 1) * cellWidth,
                 j * cellWidth);
          }
          if (cell.bottom) {
            line(i * cellWidth,
                 (j + 1) * cellWidth,
                 (i + 1) * cellWidth,
                 (j + 1) * cellWidth);
          }
          if (cell.left) {
            line(i * cellWidth,
                 j * cellWidth,
                 i * cellWidth,
                 (j + 1) * cellWidth);
          }
          if (cell.right) {
            line((i + 1) * cellWidth,
                 j * cellWidth,
                 (i + 1) * cellWidth,
                 (j + 1) * cellWidth);
          }
        }
      }
    }
  };

  function init() {
    for (var i = 0; i < width; i++) {
      cells.push([]);
      for (var j = 0; j < width; j++) {
        cells[i].push({
          x: i,
          y: j,
          top: true,
          left: true,
          bottom: true,
          right: true,
          visited: false
        });
      }
    }
  }

  init();

  return self;
}

// This is based on the DFS algorithm described in
// https://en.wikipedia.org/wiki/Maze_generation_algorithm.
function DepthFirstMazeBuilder(wallGrid, random) {
  random = random || window.random;
  var path = [wallGrid.cells[0][0]];
  var OPPOSITES = {
    left: 'right',
    right: 'left',
    top: 'bottom',
    bottom: 'top'
  };

  return {
    build: function() {
      while (this.buildOne());
    },
    buildOne: function() {
      if (path.length == 0) return false;

      var cells = wallGrid.cells;
      var latest = path[path.length - 1];
      var x = latest.x;
      var y = latest.y;
      var unvisitedDirs = [];

      if (x > 0 && !cells[x - 1][y].visited)
        unvisitedDirs.push('left');
      if (x < wallGrid.width - 1 && !cells[x + 1][y].visited)
        unvisitedDirs.push('right');
      if (y > 0 && !cells[x][y - 1].visited) 
        unvisitedDirs.push('top');
      if (y < wallGrid.width - 1 && !cells[x][y + 1].visited) 
        unvisitedDirs.push('bottom');

      if (unvisitedDirs.length == 0) {
        path.pop();
        return this.buildOne();
      }

      var dirIndex = Math.floor(random(0, unvisitedDirs.length));
      var direction = unvisitedDirs[dirIndex];
      var next;

      if (direction == 'left') {
        next = cells[x - 1][y];
      } else if (direction == 'right') {
        next = cells[x + 1][y];
      } else if (direction == 'top') {
        next = cells[x][y - 1];
      } else if (direction == 'bottom') {
        next = cells[x][y + 1];
      }

      latest[direction] = false;
      next[OPPOSITES[direction]] = false;
      next.visited = true;
      path.push(next);

      return true;
    }
  };
}
