var grid = [];

function getSquare(x, y) {
  return grid[(WIDTH + x) % WIDTH][(WIDTH + y) % WIDTH];
}

function smoothGrid(grid) {
  var sum;
  var newGrid = [];

  for (var i = 0; i < WIDTH; i++) {
    newGrid.push([]);
    for (var j = 0; j < WIDTH; j++) {
      sum = [
        getSquare(i - 1, j - 1), // top-left
        getSquare(i, j - 1),     // top
        getSquare(i + 1, j - 1), // top-right
        getSquare(i - 1, j),     // left
        getSquare(i + 1, j),     // right
        getSquare(i - 1, j + 1), // bottom-left
        getSquare(i, j + 1),     // bottom
        getSquare(i + 1, j + 1)  // bottom-right
      ].reduce(function(prev, value) { return prev + value; }, 0);
      if ((sum / 8) > SMOOTH_THRESHOLD) {
        newGrid[i].push(1);
      } else {
        newGrid[i].push(0);
      }
    }
  }
  return newGrid;
}
