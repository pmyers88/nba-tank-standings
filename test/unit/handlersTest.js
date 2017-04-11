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

  describe('#_getTopNTeams', function () {
    const _getTopNTeams = handlers.__get__('_getTopNTeams');
    let handleRequest;

    beforeEach(function () {
      handleRequest = sinon.stub(NBAClient, '_handleRequest');
    });

    afterEach(function () {
      NBAClient._handleRequest.restore();
    });

    it('should return the top n teams', function () {
      const expected = {statusCode: 200, json: standings};
      handleRequest.callsArgWith(1, expected);

      const getTopNTeams = _getTopNTeams(4);

      return getTopNTeams.then(topTeams => {
        topTeams.length.should.equal(4);
        topTeams.should.eql(['the Celtics', 'the Suns', 'the Lakers', 'the Magic']);
      });
    });

    it('should handle all trades correctly', function () {
      const expected = {statusCode: 200, json: standings};
      handleRequest.callsArgWith(1, expected);

      const getTopNTeams = _getTopNTeams(30);

      return getTopNTeams.then(topTeams => {
        topTeams.length.should.equal(30);
        topTeams.should.eql(['the Celtics', 'the Suns', 'the Lakers', 'the Magic', 'the 76ers', 'the Knicks',
          'the Timberwolves', 'the Kings', 'the Mavericks', 'the Kings', 'the Hornets', 'the Pistons', 'the Nuggets',
          'the Heat', 'the Bulls', 'the Trail Blazers', 'the Pacers', 'the Bucks', 'the Hawks', 'the Trail Blazers',
          'the Thunder', 'the Nets', 'the Raptors', 'the Jazz', 'the Magic', 'the Trail Blazers', 'the Nets',
          'the Lakers', 'the Spurs', 'the Jazz']);
      });
    });

    it('should reject the promise when there is an error', function () {
      const expected = {statusCode: 400, json: {}};
      handleRequest.callsArgWith(1, expected);

      const getTopNTeams = _getTopNTeams(4);

      return getTopNTeams.catch(error => {
        error.message.should.equal(`Received invalid HTTP response code: 400`);
      });
    });
  });
});
