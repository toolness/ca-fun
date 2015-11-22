var Ray = {
  trace: function(grid, x1, y1, x2, y2, cb) {
    var slope = Math.abs((y1 - y2) / (x1 - x2));
    var y = y1;
    var x = x1;
    var xDir = (x2 >= x1) ? 1 : -1;
    var yDir = (y2 >= y1) ? 1 : -1;
    var isObstructed = false;
    var ensureNotObstructed = function(x, y) {
      if (grid.getSquare(Math.floor(x), Math.floor(y)) === grid.EMPTY) {
        return true;
      }
      isObstructed = true;
      return false;
    }

    cb = cb || function() {};

    if (Math.abs(slope) === Infinity) {
      while (y != y2 && ensureNotObstructed(x, y)) {
        cb(x, y);
        y += yDir;
      }
    } else if (slope <= 1) {
      while (x != x2 && ensureNotObstructed(x, y)) {
        cb(x, Math.floor(y));
        y += slope * yDir;
        x += xDir;
      }
    } else if (slope > 1) {
      while (y != y2 && ensureNotObstructed(x, y)) {
        cb(Math.floor(x), y);
        x += 1 / slope * xDir;
        y += yDir;
      }
    }

    if (!isObstructed) ensureNotObstructed(x2, y2);
    if (!isObstructed) cb(x2, y2);
    return !isObstructed;
  },
  draw: function(grid, x1, y1, x2, y2, col) {
    return this.trace(grid, x1, y1, x2, y2, function(x, y) {
      grid.drawSquare(x, y, col);
    });
  }
};
