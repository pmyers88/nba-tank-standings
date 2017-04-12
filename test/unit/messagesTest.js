const chai = require('chai');
const _size = require('lodash/size');

const messages = require('../../src/messages');

chai.should();

describe('Messages', function () {
  it('should contain message keys', function () {
    messages.should.contain.keys('HELP_MESSAGE',
      'LOTTERY_SIMULATION_CARD_TITLE',
      'NUMBER_NOT_HEARD',
      'STANDINGS_REQUEST_ERROR',
      'STOP_MESSAGE',
      'TANK_STANDINGS_CARD_TITLE',
      'TEAM_NOT_HEARD_ERROR',
      'UNHANDLED_MESSAGE',
      'WELCOME_MESSAGE',
      'WELCOME_REPROMPT'
    );
  });

  it('should have 17 keys', function () {
    _size(messages).should.equal(17);
  });

  describe('#getLotterySimulationMessage', function () {
    it('should return the correct message', function () {
      const expected = 'After simulating the lottery, the new draft order is the 76ers, the Nets, the Suns, and ' +
          'the 76ers.';
      messages.getLotterySimulationMessage(['the 76ers', 'the Nets', 'the Suns', 'the 76ers']).should.equal(expected);
    });
  });

  describe('#getLotterySimulationText', function () {
    it('should return the correct message', function () {
      const expected = 'After simulating the lottery, the new draft order is:\n1. 76ers\n2. Nets\n3. Suns\n' +
          '4. 76ers';
      messages.getLotterySimulationText(['1. 76ers', '2. Nets', '3. Suns', '4. 76ers']).should.equal(expected);
    });
  });

  describe('#getTankStandingsMessage', function () {
    it('should return the correct message for 1 team', function () {
      const expected = 'The top team in the tank standings is the Nets.';
      messages.getTankStandingsMessage(['the Nets']).should.equal(expected);
    });

    it('should return the correct message for 2 teams', function () {
      const expected = 'The top 2 teams in the tank standings are the Nets and the Suns.';
      messages.getTankStandingsMessage(['the Nets', 'the Suns']).should.equal(expected);
    });

    it('should return the correct message for > 2 teams', function () {
      let expected = 'The top 3 teams in the tank standings are the Nets, the Suns, and the Lakers.';
      messages.getTankStandingsMessage(['the Nets', 'the Suns', 'the Lakers']).should.equal(expected);

      expected = 'The top 5 teams in the tank standings are the Nets, the Suns, the Lakers, the Magic, and the 76ers.';
      messages.getTankStandingsMessage(['the Nets', 'the Suns', 'the Lakers', 'the Magic', 'the 76ers']).should.equal(
          expected);
    });
  });

  describe('#getTankStandingsText', function () {
    it('should return the correct message for 1 team', function () {
      const expected = 'The top team in the tank standings is:\n1. Nets';
      messages.getTankStandingsText(['1. Nets']).should.equal(expected);
    });

    it('should return the correct message for 2 teams', function () {
      const expected = 'The top 2 teams in the tank standings are:\n1. Nets\n2. Suns';
      messages.getTankStandingsText(['1. Nets', '2. Suns']).should.equal(expected);
    });

    it('should return the correct message for > 2 teams', function () {
      let expected = 'The top 3 teams in the tank standings are:\n1. Nets\n2. Suns\n3. Lakers';
      messages.getTankStandingsText(['1. Nets', '2. Suns', '3. Lakers']).should.equal(expected);

      expected = 'The top 5 teams in the tank standings are:\n1. Nets\n2. Suns\n3. Lakers\n4. Magic\n5. 76ers';
      messages.getTankStandingsText(['1. Nets', '2. Suns', '3. Lakers', '4. Magic', '5. 76ers']).should.equal(
          expected);
    });
  });

  describe('#getTankStandingsCardTitle', function () {
    it('should return the card title for a given team', function () {
      const expected = '76ers Tank Standings';
      messages.getTankStandingsCardTitle('76ers').should.equal(expected);
    });
  });

  describe('#getTeamNotFoundError', function () {
    it('should return a message saying that the team was not found', function () {
      const expected = 'Sorry, I could not find a team named Eagles. Please ask again.';
      messages.getTeamNotFoundError('Eagles').should.equal(expected);
    });
  });

  describe('#getTeamStandingsMessage', function () {
    it('should return the correct message', function () {
      const expected = 'The Nets are currently ranked 1st in the tank standings.';
      messages.getTeamStandingsMessage('Nets', 1).should.equal(expected);
    });
  });
});
