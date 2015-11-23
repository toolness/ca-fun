var SQUARE_SIZE = 8;
var SMOOTH_THRESHOLD = 0.6;

var seed;
var grid;
var player;
var dog;
var skateboarder;
var treats;
var agents;

var fields = {
  generations: document.getElementById("generations"),
  size: document.getElementById('size'),
  viewportSize: document.getElementById('viewport-size'),
  connected: document.getElementById("connected"),
  showGrid: document.getElementById("show-grid"),
  filledPercent: document.getElementById("filled-percent"),
  filledColor: document.getElementById("filled-color"),
  emptyColor: document.getElementById("empty-color"),
  seed: document.getElementById('random-seed')
};

function regenerate() {
  var generations = parseInt(fields.generations.value);
  var shareLink = document.getElementById('share');

  shareLink.setAttribute('href', Querystring.serialize({
    seed: seed,
    connected: fields.connected.checked,
    generations: generations,
    showGrid: fields.showGrid.checked,
    filledColor: fields.filledColor.value,
    filledPercent: fields.filledPercent.value,
    emptyColor: fields.emptyColor.value,
    viewportSize: grid.viewportWidth,
    size: grid.width
  }));

  randomSeed(seed);

  grid.createRandom(parseFloat(fields.filledPercent.value));

  for (var k = 0; k < generations; k++) {
    grid.smooth(SMOOTH_THRESHOLD);
  }

  if (fields.connected.checked)
    grid.makeWellConnected();

  agents = [];
  treats = [];

  player = Agent.placeRandomly(grid, 'red');
  player.setState(AgentStateFollow);

  skateboarder = Agent.placeRandomly(grid, 'blue');
  skateboarder.setState(AgentStateDrunk);

  dog = Agent.placeRandomly(grid, 'violet');
  dog.setState(DogAgentState, {
    owner: player,
    treats: treats,
    stayAwayFrom: skateboarder
  });

  for (k = 0; k < 10; k++) {
    treats.push(Agent.placeRandomly(grid, 'yellow'));
  }

  agents.push(dog);
  agents.push(player);
  agents.push(skateboarder);

  grid.resizeCanvas();
}

function createGrid() {
  return new Grid({
    width: parseInt(fields.size.value),
    showGrid: fields.showGrid.checked,
    filledColor: '#' + fields.filledColor.value,
    emptyColor: '#' + fields.emptyColor.value,
    viewportWidth: parseInt(fields.viewportSize.value),
    edgeValue: Grid.FILLED,
    squareSize: SQUARE_SIZE
  });
}

function setup() {
  fields.filledColor.jscolor.fromString(
    Querystring.get('filledColor', fields.filledColor.value)
  );
  fields.emptyColor.jscolor.fromString(
    Querystring.get('emptyColor', fields.emptyColor.value)
  );
  fields.filledPercent.value = Querystring.getFloat(
    'filledPercent',
    fields.filledPercent.value
  );
  fields.generations.value = Querystring.getInt('generations',
                                                fields.generations.value);
  fields.size.value = Querystring.getInt('size', fields.size.value);
  fields.viewportSize.value = Querystring.getInt('viewportSize',
                                                 fields.viewportSize.value);
  fields.connected.checked = Querystring.getBool('connected',
                                                 fields.connected.checked);
  fields.showGrid.checked = Querystring.getBool('showGrid',
                                                fields.showGrid.checked);

  grid = createGrid();

  grid.createCanvas();

  // p5 appends the canvas at the document, so we'll re-position the footer
  // so it's at the bottom of the page.
  document.body.appendChild(document.querySelector("footer"));

  seed = Querystring.getInt('seed', Date.now());
  fields.seed.value = seed;

  fields.viewportSize.onchange = function() {
    fields.size.value = Math.max(fields.size.value, fields.viewportSize.value);
  };

  fields.size.onchange = function() {
    fields.viewportSize.value = Math.min(fields.size.value, fields.viewportSize.value);
  };

  document.getElementById("regenerate").onclick = function() {
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
    Math.floor(player.y / grid.viewportWidth) * grid.viewportWidth,
    Math.floor(player.x / grid.viewportWidth) * grid.viewportWidth
  );

  grid.draw();

  treats.forEach(function(treat) {
    treat.draw();
  });

  agents.forEach(function(agent) {
    agent.draw();
  });
}
