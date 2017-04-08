const chai = require('chai');

const intents = require('../../src/intents');

chai.should();

describe('Intents', function () {
  it('should have GET_TANK_RANKINGS intent with value GetTankRankings', function () {
    intents.GET_TANK_RANKINGS.should.equal('GetTankRankings');
  });

  it('should have GET_LOTTERY_SIMULATION intent with value GetLotterySimulation', function () {
    intents.GET_LOTTERY_SIMULATION.should.equal('GetLotterySimulation');
  });

  it('should have GET_TOP_N_TANK_RANKINGS intent with value GetTopNTankRankings', function () {
    intents.GET_TOP_N_TANK_RANKINGS.should.equal('GetTopNTankRankings');
  });

  it('should have GET_TEAM_RANKINGS intent with value GetTeamRankings', function () {
    intents.GET_TEAM_RANKINGS.should.equal('GetTeamRankings');
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
