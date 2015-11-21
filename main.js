var SQUARE_SIZE = 8;
var VIEWPORT_WIDTH = 32;
var SMOOTH_THRESHOLD = 0.6;

var seed;
var grid;
var planningFollower;
var agents = [];

function regenerate() {
  var generations = parseInt(document.getElementById("generations").value);

  randomSeed(seed);

  grid.createRandom();

  for (var k = 0; k < generations; k++) {
    grid.smooth(SMOOTH_THRESHOLD);
  }

  if (document.getElementById("connected").checked)
    grid.makeWellConnected();

  agents = [];

  var drunkard = Agent.placeRandomly(grid, 'blue');
  drunkard.setState(AgentStateDrunk);
  agents.push(drunkard);

  var follower = Agent.placeRandomly(grid, 'violet');
  follower.setState(AgentStateFollowMouse);
  agents.push(follower);

  planningFollower = Agent.placeRandomly(grid, 'red');
  planningFollower.setState(AgentStateFollowMouseWithPlanning);
  agents.push(planningFollower);
}

// http://stackoverflow.com/a/901144
function getQuerystringParam(name, defaultValue) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
  var results = regex.exec(location.search);
  return results === null
         ? (defaultValue || "")
         : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function getIntQuerystringParam(name, defaultValue) {
  var result = parseInt(getQuerystringParam(name));
  if (isNaN(result))
    return defaultValue;
  return result;
}

function createGrid(size) {
  return new Grid({
    width: parseInt(size),
    viewportWidth: VIEWPORT_WIDTH,
    edgeValue: Grid.FILLED,
    squareSize: SQUARE_SIZE
  });
}

function setup() {
  var sizeField = document.getElementById('size');
  var seedField = document.getElementById('random-seed');

  sizeField.value = getIntQuerystringParam('size', sizeField.value);

  grid = createGrid(sizeField.value);

  grid.createCanvas();

  // p5 appends the canvas at the document, so we'll re-position the footer
  // so it's at the bottom of the page.
  document.body.appendChild(document.querySelector("footer"));

  seed = getIntQuerystringParam('seed', Date.now());
  seedField.value = seed;

  document.getElementById("regenerate").onclick = function() {
    if (sizeField.value !== grid.width)
      grid = createGrid(sizeField.value);

    if (document.getElementById("new-seed").checked) {
      seed = Date.now();
      seedField.value = seed;
    } else {
      seed = parseInt(seedField.value);
    }

    regenerate();
  };

  regenerate();
}

function draw() {
  grid.setViewportTopLeft(
    Math.floor(planningFollower.y / grid.viewportWidth) * grid.viewportWidth,
    Math.floor(planningFollower.x / grid.viewportWidth) * grid.viewportWidth
  );

  grid.draw();

  agents.forEach(function(agent) {
    agent.draw();
  });
}
