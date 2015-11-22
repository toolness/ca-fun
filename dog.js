function DogAgentState(agent, pInst, options) {
  var MIN_DIST = 2;
  var MAX_STAMINA = 50;
  var STAMINA_REGEN_RATE = 2;
  var owner = options.owner;
  var stamina = MAX_STAMINA;
  var staminaState = 'active';
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
      if (staminaState == 'resting') {
        stamina += STAMINA_REGEN_RATE;
        if (stamina >= MAX_STAMINA) {
          stamina = MAX_STAMINA;
          staminaState = 'active';
        }
      } else {
        if (lastOwnerPos) {
          if (!followState.move())
            searchState.move();
        } else {
          searchState.move();
        }
        stamina--;
        if (stamina == 0)
          staminaState = 'resting';
      }
    }
  }
};
