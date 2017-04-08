const chai = require('chai');
const _size = require('lodash/size');

const messages = require('../../src/messages');

chai.should();

describe('Messages', function () {
  it('should contain message keys', function () {
    messages.should.contain.keys('HELP_MESSAGE',
      'STANDINGS_REQUEST_ERROR',
      'STOP_MESSAGE',
      'TANK_STANDINGS_CARD_TITLE',
      'TEAM_NOT_HEARD_ERROR',
      'UNHANDLED_MESSAGE',
      'WELCOME_MESSAGE',
      'WELCOME_REPROMPT'
    );
  });

  it('should have 12 keys', function () {
    _size(messages).should.equal(12);
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
