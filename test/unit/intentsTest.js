const chai = require('chai');

const intents = require('../../src/intents');

chai.should();

describe('Intents', function () {
  it('should have GET_TANK_RANKINGS intent with value GetTankStandings', function () {
    intents.GET_TANK_RANKINGS.should.equal('GetTankStandings');
  });

  it('should have GET_LOTTERY_SIMULATION intent with value GetLotterySimulation', function () {
    intents.GET_LOTTERY_SIMULATION.should.equal('GetLotterySimulation');
  });

  it('should have GET_TOP_N_TANK_RANKINGS intent with value GetTopNTankStandings', function () {
    intents.GET_TOP_N_TANK_RANKINGS.should.equal('GetTopNTankStandings');
  });

  it('should have GET_TEAM_RANKINGS intent with value GetTeamStandings', function () {
    intents.GET_TEAM_RANKINGS.should.equal('GetTeamStandings');
  });

  it('should have AMAZON_HELP intent with value AMAZON.HelpIntent', function () {
    intents.AMAZON_HELP.should.equal('AMAZON.HelpIntent');
  });

  it('should have AMAZON_STOP intent with value AMAZON.StopIntent', function () {
    intents.AMAZON_STOP.should.equal('AMAZON.StopIntent');
  });

  it('should have AMAZON_CANCEL intent with value AMAZON.CancelIntent', function () {
    intents.AMAZON_CANCEL.should.equal('AMAZON.CancelIntent');
  });
});
