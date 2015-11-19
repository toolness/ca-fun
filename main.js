var SQUARE_SIZE = 8;
var WIDTH = 32;
var SMOOTH_THRESHOLD = 0.6;
var GENERATIONS = 3;

var seed;
var grid;
var agents = [];

function regenerate() {
  randomSeed(seed);

  grid.createRandom();

  for (var k = 0; k < GENERATIONS; k++) {
    grid.smooth(SMOOTH_THRESHOLD);
  }

  grid.makeWellConnected();

  agents = [];

  var drunkard = Agent.placeRandomly(grid, 'blue');
  drunkard.setState(AgentStateDrunk);
  agents.push(drunkard);

  var follower = Agent.placeRandomly(grid, 'violet');
  follower.setState(AgentStateFollowMouse);
  agents.push(follower);

  var planningFollower = Agent.placeRandomly(grid, 'red');
  planningFollower.setState(AgentStateFollowMouseWithPlanning);
  agents.push(planningFollower);
}

function setup() {
  grid = new Grid({
    width: WIDTH,
    edgeValue: Grid.FILLED,
    squareSize: SQUARE_SIZE
  });

  grid.createCanvas();

  // p5 appends the canvas at the document, so we'll re-position the footer
  // so it's at the bottom of the page.
  document.body.appendChild(document.querySelector("footer"));

  var seedMatch = window.location.search.match(/[?&]seed=(\d+)/);
  if (seedMatch) {
    seed = parseInt(seedMatch[1]);
  } else {
    seed = Date.now();
  }

  document.getElementById("regenerate").onclick = function() {
    seed = Date.now();
    regenerate();
  };

  regenerate();
}

function draw() {
  grid.draw();

  agents.forEach(function(agent) {
    agent.draw();
  });
}
