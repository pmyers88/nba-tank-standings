'use strict';

const chai = require('chai');

const NBAClient = require('../../src/NBAClient');
const standingsConference = require('../fixtures/standings_conference.json');

chai.should();

describe('NBAClient', function () {
  describe('#getLeagueStandings', function () {
    it('should return 30 teams', function () {
      const standings = NBAClient.getLeagueStandings(standingsConference);
      standings.length.should.equal(30);
    });

    it('teams should be sorted by win pct asc', function () {
      let winPct = '.000';
      const standings = NBAClient.getLeagueStandings(standingsConference);
      standings.forEach(team => {
        team.winPct.should.be.at.least(winPct);
        winPct = team.winPct;
      });
    });
  });
});
