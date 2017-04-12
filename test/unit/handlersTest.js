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
        topTeams.should.eql([{owner: 'Celtics', from: 'Nets'}, {owner: 'Suns', from: 'Suns'},
          {owner: 'Lakers', from: 'Lakers'}, {owner: 'Magic', from: 'Magic'}, {owner: '76ers', from: '76ers'},
          {owner: 'Knicks', from: 'Knicks'}, {owner: 'Timberwolves', from: 'Timberwolves'},
          {owner: 'Kings', from: 'Kings'}, {owner: 'Mavericks', from: 'Mavericks'}, {owner: 'Kings', from: 'Pelicans'},
          {owner: 'Hornets', from: 'Hornets'}, {owner: 'Pistons', from: 'Pistons'}, {owner: 'Nuggets', from: 'Nuggets'},
          {owner: 'Heat', from: 'Heat'}, {owner: 'Bulls', from: 'Bulls'},
          {owner: 'Trail Blazers', from: 'Trail Blazers'}, {owner: 'Pacers', from: 'Pacers'},
          {owner: 'Bucks', from: 'Bucks'}, {owner: 'Hawks', from: 'Hawks'}, {owner: 'Trail Blazers', from: 'Grizzlies'},
          {owner: 'Thunder', from: 'Thunder'}, {owner: 'Nets', from: 'Wizards'}, {owner: 'Raptors', from: 'Raptors'},
          {owner: 'Jazz', from: 'Jazz'}, {owner: 'Magic', from: 'Clippers'}, {owner: 'Trail Blazers', from: 'Cavaliers'},
          {owner: 'Nets', from: 'Celtics'}, {owner: 'Lakers', from: 'Rockets'}, {owner: 'Spurs', from: 'Spurs'},
          {owner: 'Jazz', from: 'Warriors'}]);
      });
    });
  });

  describe('#_addThe', function () {
    const _addThe = handlers.__get__('_addThe');

    it('should add "the" to each string in array', function () {
      const teams = [{owner: 'Celtics', from: 'Nets'}, {owner: 'Suns', from: 'Suns'}, {owner: 'Lakers', from: 'Lakers'},
          {owner: '76ers', from: '76ers'}];
      const teamsThe = _addThe(teams);
      teamsThe.should.eql(['the Celtics via the Nets', 'the Suns', 'the Lakers', 'the 76ers']);
    });
  });

  describe('#_numericalOutput', function () {
    const _numericalOutput = handlers.__get__('_numericalOutput');

    it('should add newline + index to each string in array', function () {
      const teams = [{owner: 'Celtics', from: 'Nets'}, {owner: 'Suns', from: 'Suns'}, {owner: 'Lakers', from: 'Lakers'},
          {owner: '76ers', from: '76ers'}];
      const teamsThe = _numericalOutput(teams);
      teamsThe.should.eql(['1. Celtics (via the Nets)', '2. Suns', '3. Lakers', '4. 76ers']);
    });
  });
});
