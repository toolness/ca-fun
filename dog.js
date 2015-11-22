function DogAgentState(agent, pInst, options) {
  var MIN_DIST = 2;
  var owner = options.owner;
  var plan = [];
  var lastOwnerPos;
  var searchState = new AgentStateDrunk(agent, pInst);
  var followState = new AgentStateFollow(agent, pInst, {
    getTargetPosition: function() {
      return lastOwnerPos;
    }
  });

  return {
    move: function() {
      var distanceToOwner = Math.abs(owner.x - agent.x) +
                            Math.abs(owner.y - agent.y);
      var inLineOfSight = Ray.trace(agent.grid, agent.x, agent.y,
                                    owner.x, owner.y);
      if (inLineOfSight) {
        if (distanceToOwner > MIN_DIST) {
          lastOwnerPos = {x: owner.x, y: owner.y};
        } else {
          lastOwnerPos = null;
        }
      }
      if (lastOwnerPos) {
        if (!followState.move())
          return searchState.move();
      } else {
        return searchState.move();
      }
    }
  }
};
