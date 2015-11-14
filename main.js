var SQUARE_SIZE = 8;
var WIDTH = 32;
var SMOOTH_THRESHOLD = 0.6;
var GENERATIONS = 3;
var RANDOM_SEED = Date.now();

var grid;
var agents = [];

function setup() {
  randomSeed(RANDOM_SEED);
  createCanvas(SQUARE_SIZE * WIDTH, SQUARE_SIZE * WIDTH);
  background("black");

  grid = new Grid({
    width: WIDTH,
    edgeValue: Grid.FILLED,
    squareSize: SQUARE_SIZE
  });

  for (var k = 0; k < GENERATIONS; k++) {
    grid.smooth(SMOOTH_THRESHOLD);
  }

  agents.push(Agent.placeRandomly(grid));
  agents[0].state = new AgentStateDrunk();
}

function draw() {
  var selX = Math.floor(mouseX / SQUARE_SIZE);
  var selY = Math.floor(mouseY / SQUARE_SIZE);

  grid.draw();

  agents.forEach(function(agent) {
    agent.draw();
  });
}
