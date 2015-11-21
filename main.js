var SQUARE_SIZE = 8;
var VIEWPORT_WIDTH = 32;
var SMOOTH_THRESHOLD = 0.6;

var seed;
var grid;
var planningFollower;
var agents = [];

var fields = {
  generations: document.getElementById("generations"),
  size: document.getElementById('size'),
  connected: document.getElementById("connected"),
  seed: document.getElementById('random-seed')
};

function regenerate() {
  var generations = parseInt(fields.generations.value);
  var shareLink = document.getElementById('share');

  shareLink.setAttribute('href', Querystring.serialize({
    seed: seed,
    connected: fields.connected.checked,
    generations: generations,
    size: grid.width
  }));

  randomSeed(seed);

  grid.createRandom();

  for (var k = 0; k < generations; k++) {
    grid.smooth(SMOOTH_THRESHOLD);
  }

  if (fields.connected.checked)
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

function createGrid() {
  return new Grid({
    width: parseInt(fields.size.value),
    viewportWidth: VIEWPORT_WIDTH,
    edgeValue: Grid.FILLED,
    squareSize: SQUARE_SIZE
  });
}

function setup() {
  fields.generations.value = Querystring.getInt('generations',
                                                fields.generations.value);
  fields.size.value = Querystring.getInt('size', fields.size.value);
  fields.connected.checked = Querystring.getBool('connected',
                                                 fields.connected.checked);

  grid = createGrid();

  grid.createCanvas();

  // p5 appends the canvas at the document, so we'll re-position the footer
  // so it's at the bottom of the page.
  document.body.appendChild(document.querySelector("footer"));

  seed = Querystring.getInt('seed', Date.now());
  fields.seed.value = seed;

  document.getElementById("regenerate").onclick = function() {
    if (parseInt(fields.size.value) !== grid.width)
      grid = createGrid();

    if (document.getElementById("new-seed").checked) {
      seed = Date.now();
      fields.seed.value = seed;
    } else {
      seed = parseInt(fields.seed.value);
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
