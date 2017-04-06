const chai = require('chai');

const messages = require('../../src/Messages');

chai.should();

describe('Messages', function () {
  it('should contain message keys', function () {
    messages.should.contain.keys('HELP_MESSAGE', 'STOP_MESSAGE');
  });

  describe('#getTankRankingsMessage', function () {
    it('should return the correct message for the given arguments', function () {
      let expected = 'The top team in the tank rankings is the Nets.';
      messages.getTankRankingsMessage(['the Nets']).should.equal(expected);

      expected = 'The top 2 teams in the tank rankings are the Nets and the Suns.';
      messages.getTankRankingsMessage(['the Nets', 'the Suns']).should.equal(expected);

      expected = 'The top 3 teams in the tank rankings are the Nets, the Suns, and the Lakers.';
      messages.getTankRankingsMessage(['the Nets', 'the Suns', 'the Lakers']).should.equal(expected);

      expected = 'The top 5 teams in the tank rankings are the Nets, the Suns, the Lakers, the Magic, and the 76ers.';
      messages.getTankRankingsMessage(['the Nets', 'the Suns', 'the Lakers', 'the Magic', 'the 76ers']).should.equal(
          expected);
    });
  });
});
