var SQUARE_SIZE = 8;
var WIDTH = 32;
var SMOOTH_THRESHOLD = 0.6;
var GENERATIONS = 3;
var RANDOM_SEED = Date.now();

var grid;
var agents = [];

function setup() {
  randomSeed(RANDOM_SEED);

  grid = new Grid({
    width: WIDTH,
    edgeValue: Grid.FILLED,
    squareSize: SQUARE_SIZE
  });

  grid.createCanvas();
  grid.createRandom();

  for (var k = 0; k < GENERATIONS; k++) {
    grid.smooth(SMOOTH_THRESHOLD);
  }

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

function draw() {
  grid.draw();

  agents.forEach(function(agent) {
    agent.draw();
  });
}
