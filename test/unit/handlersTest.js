const chai = require('chai');
const sinon = require('sinon');
const _ = require('lodash');
const rewire = require('rewire');

const handlers = rewire('../../src/handlers');
const intents = require('../../src/intents');
const events = require('../../src/events');
const standings = require('../fixtures/standings_conference');
const NBAClient = require('../../src/NBAClient');

chai.should();

describe('handlers', function () {
  it('should have the same number of methods as intents.length + events.length', function () {
    _.size(handlers).should.equal(_.size(intents) + _.size(events));
  });

  it('should have a key for every value in intents', function () {
    handlers.should.have.any.keys(_.values(intents));
  });

  it('should have a key for every value in events', function () {
    handlers.should.have.any.keys(_.values(events));
  });

  describe('#_resolveTrades', function () {
    const _resolveTrades = handlers.__get__('_resolveTrades');
    let handleRequest;

    beforeEach(function () {
      handleRequest = sinon.stub(NBAClient, '_handleRequest');
    });

    afterEach(function () {
      NBAClient._handleRequest.restore();
    });

    it('should handle all trades correctly', function () {
      const expected = {statusCode: 200, json: standings};
      handleRequest.callsArgWith(1, expected);

      const standingsRequest = NBAClient.getStandingsRequest();
      return standingsRequest.then(topTeams => {
        topTeams = _resolveTrades(topTeams);
        topTeams.length.should.equal(30);
        topTeams.should.eql(['Celtics', 'Suns', 'Lakers', 'Magic', '76ers', 'Knicks',
          'Timberwolves', 'Kings', 'Mavericks', 'Kings', 'Hornets', 'Pistons', 'Nuggets',
          'Heat', 'Bulls', 'Trail Blazers', 'Pacers', 'Bucks', 'Hawks', 'Trail Blazers',
          'Thunder', 'Nets', 'Raptors', 'Jazz', 'Magic', 'Trail Blazers', 'Nets',
          'Lakers', 'Spurs', 'Jazz']);
      });
    });
  });

  describe('#_addThe', function () {
    const _addThe = handlers.__get__('_addThe');

    it('should add "the" to each string in array', function () {
      const teams = ['Celtics', 'Suns', 'Lakers', '76ers'];
      const teamsThe = _addThe(teams);
      teamsThe.should.eql(['the Celtics', 'the Suns', 'the Lakers', 'the 76ers']);
    });
  });

  describe('#_numericalOutput', function () {
    const _numericalOutput = handlers.__get__('_numericalOutput');

    it('should add newline + index to each string in array', function () {
      const teams = ['Celtics', 'Suns', 'Lakers', '76ers'];
      const teamsThe = _numericalOutput(teams);
      teamsThe.should.eql(['1. Celtics', '2. Suns', '3. Lakers', '4. 76ers']);
    });
  });
});
