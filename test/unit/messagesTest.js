const chai = require('chai');
const _size = require('lodash/size');

const messages = require('../../src/messages');

chai.should();

describe('Messages', function () {
  it('should contain message keys', function () {
    messages.should.contain.keys('GET_TANK_RANKINGS_CARD_TITLE', 'HELP_MESSAGE', 'STOP_MESSAGE', 'UNHANDLED_MESSAGE',
        'WELCOME_MESSAGE', 'WELCOME_REPROMPT');
  });

  it('should have 8 keys', function () {
    _size(messages).should.equal(8);
  });

  describe('#getTankRankingsMessage', function () {
    it('should return the correct message for 1 team', function () {
      const expected = 'The top team in the tank rankings is the Nets.';
      messages.getTankRankingsMessage(['the Nets']).should.equal(expected);
    });

    it('should return the correct message for 2 teams', function () {
      const expected = 'The top 2 teams in the tank rankings are the Nets and the Suns.';
      messages.getTankRankingsMessage(['the Nets', 'the Suns']).should.equal(expected);
    });

    it('should return the correct message for > 2 teams', function () {
      let expected = 'The top 3 teams in the tank rankings are the Nets, the Suns, and the Lakers.';
      messages.getTankRankingsMessage(['the Nets', 'the Suns', 'the Lakers']).should.equal(expected);

      expected = 'The top 5 teams in the tank rankings are the Nets, the Suns, the Lakers, the Magic, and the 76ers.';
      messages.getTankRankingsMessage(['the Nets', 'the Suns', 'the Lakers', 'the Magic', 'the 76ers']).should.equal(
          expected);
    });
  });

  describe('#getTeamRankingsMessage', function () {
    it('should return the correct message', function () {
      const expected = 'The Nets are currently ranked 1st in the tank standings.';
      messages.getTeamRankingsMessage('Nets', 1).should.equal(expected);
    });
  });
});
