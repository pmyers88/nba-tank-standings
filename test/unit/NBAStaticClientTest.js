'use strict';

const chai = require('chai');

const NBAClient = require('../../src/NBAStaticClient');
const standingsConference = require(`../../resources/${process.env.FINAL_STANDINGS_FILE}`);

chai.should();

describe('NBAClient', function () {
  describe('#getLeagueStandings', function () {
    it('should return 30 teams', function () {
      const standings = NBAClient._getLeagueStandings(standingsConference);
      standings.length.should.equal(30);
    });

    it('teams should be sorted by draft order asc', function () {
      let order = 0;
      const standings = NBAClient._getLeagueStandings(standingsConference);
      standings.forEach(team => {
        team.sortKey.draftOrder.should.equal(order + 1);
        order = team.sortKey.draftOrder;
      });
    });
  });
});
