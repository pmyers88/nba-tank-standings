'use strict';

const NBAClient = require('./NBAClient');
const finalStandings = require(`../resources/${process.env.FINAL_STANDINGS_FILE}`);

class NBAStaticClient extends NBAClient {
  static getStandingsRequest () {
    return new Promise((resolve, reject) => {
      const leagueStandings = super.getLeagueStandings(finalStandings);
      resolve(leagueStandings);
    });
  }
}

module.exports = NBAStaticClient;
